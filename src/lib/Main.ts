import { logger } from './logger';
import packageJSON from '../../package.json';
import { YamlConfiguration } from './YamlConfiguration';
import { loadAll } from 'js-yaml';
import { Draft07, JsonError } from 'json-schema-library';
import schemaV1 from '../../schemas/v1.json';
import { consolidateImages } from './consolidateImages';
import { processServicesAndData } from './processServicesAndData';
import { Dependencies } from './Dependencies';
import { RegistryInformation } from './Registry';
import LookoutError from './LookoutError';
import { ScheduledTask } from 'node-cron';
import { processKeys, utils } from './utils';

export default class Main {
    private task: ScheduledTask | null = null;

    async start(dependencies: Dependencies) {
        const { config, fileServices, slack } = dependencies;

        logger.info(`Starting lookout version: ${packageJSON.version}`);
        slack.sendSlackMessage(`Starting lookout version: ${packageJSON.version}`);

        // 1. pull config
        const yamlFilename = config.getYamlFilename();
        if (!yamlFilename) {
            throw new Error('Missing YAML config file');
        }

        // 2. let's parse it
        const yamlConfigContents = await fileServices.readFile(yamlFilename);
        const yamlConfigs: YamlConfiguration[] = loadAll(
            yamlConfigContents.toString(),
        ) as unknown as YamlConfiguration[];
        if (yamlConfigs.length !== 1) {
            throw new Error('Single yaml object should exist');
        }
        const yamlConfig = yamlConfigs[0];
        processKeys(yamlConfig);

        // validate schema
        const jsonSchema: Draft07 = new Draft07(schemaV1);
        const errors: JsonError[] = jsonSchema.validate(yamlConfig);
        if (errors.length !== 0) {
            throw new LookoutError(`Invalid config file definition, schema errors`, errors);
        }

        logger.log(`Found: ${Object.keys(yamlConfig.services).length} services.`);

        const listOfImages = consolidateImages(yamlConfig);
        logger.debug(`List of images: ${JSON.stringify(listOfImages, null, 2)}`);

        // 3. run an initial cronJob when we start
        await this.cronJob(dependencies, listOfImages, yamlConfig);

        if (config.scheduleCron()) {
            logger.info(`Scheduling cron job with timer: ${config.getCron()}`);
            this.task = utils.schedule(config.getCron(), () => {
                void this.cronJob(dependencies, listOfImages, yamlConfig);
            });
        }
    }
    private async cronJob(dependencies: Dependencies, listOfImages: string[], yamlConfig: YamlConfiguration) {
        const { config, registry, fileServices, slack } = dependencies;

        logger.info(`----------------------------------------------`);
        logger.info(`Starting cron job`);
        slack.sendSlackMessage(`Starting cron job`);

        try {
            // 1. pull digest for each image
            const listOfImageInformation: RegistryInformation[] = await Promise.all(
                listOfImages.map((image) => registry.getImageInformation(dependencies, image)),
            );

            // 2. produce data object
            const data: Record<string, string> = listOfImageInformation.reduce((acc, imageInfo) => {
                if (imageInfo.latestDigest === '') {
                    return acc;
                }
                return {
                    ...acc,
                    [imageInfo.fullImageName]: imageInfo.latestDigest,
                };
            }, {});
            logger.debug(`Produced data structure: ${JSON.stringify(data, null, 2)}`);

            // 3. load previous data if found, manually update each one only if successful
            if (!(await fileServices.exists(config.getDataFilename()))) {
                // fresh new file, save and sleep
                logger.info(`Creating data file for the first time: ${config.getDataFilename()}`);
                await fileServices.writeFile(config.getDataFilename(), JSON.stringify(data, null, 2));
            } else {
                // 4. process services now and update as needed
                const previousDataFileContents = await fileServices.readFile(config.getDataFilename());
                const previousData = JSON.parse(previousDataFileContents.toString());
                if (await processServicesAndData(dependencies, yamlConfig.services, data, previousData)) {
                    //update data file now if we passed all processing //todo could be better
                    logger.info(`Updating data file with new digests: ${config.getDataFilename()}`);
                    await fileServices.writeFile(config.getDataFilename(), JSON.stringify(data, null, 2));
                }
            }
        } catch (error) {
            logger.error(`Failed to run cronjob: `, error);
            slack.sendSlackMessage(`Error: Failed to run cronjob`);
        }

        logger.info(`Cron job done`);
        slack.sendSlackMessage(`Cron job done`);
        logger.info(`----------------------------------------------`);
    }
    stop() {
        if (this.task !== null) {
            this.task.stop();
            this.task = null;
        }
    }
}

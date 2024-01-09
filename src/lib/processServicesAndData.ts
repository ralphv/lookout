import { YamlConfigurationService } from './YamlConfiguration';
import { logger } from './logger';
import { Dependencies } from './Dependencies';

export async function processServicesAndData(
    dependencies: Dependencies,
    services: Record<string, YamlConfigurationService>,
    data: Record<string, string>,
    previousData: Record<string, string>,
): Promise<boolean> {
    const { config, dockerHelper, slack } = dependencies;

    const servicesToProcess = [];

    logger.info(`**************************************`);
    for (const service of Object.keys(services)) {
        logger.info(`Detecting changes for service: '${service}'`);

        for (const image of services[service].images) {
            const previousDigest = previousData[image];
            const currentDigest = data[image];

            if (previousDigest === currentDigest) {
                logger.info(` >> image: ${image} [not changed]`);
                continue;
            }

            logger.info(` >> image: ${image} [CHANGED]`);
            servicesToProcess.push(service);
        }
    }

    if (servicesToProcess.length === 0) {
        logger.info(`No updates needed for all services`);
        return false;
    }
    logger.info(`**************************************`);

    logger.info(`Updates are required for ${servicesToProcess.length} service(s)`);

    for (const service of servicesToProcess) {
        logger.info(`Updating service ${service}`);
        slack.sendSlackMessage(`Updating service ${service}`);

        //todo check if we have custom set of commands then use those
        await dockerHelper.runDockerComposePull(config.getDockerComposeFile(), service);
        await dockerHelper.runDockerComposeBuild(config.getDockerComposeFile(), service);
        await dockerHelper.runDockerComposeUp(config.getDockerComposeFile(), service);
        // todo check if we have to push to remote registry commands

        logger.info(`Done updating service ${service}`);
    }

    return true;
}

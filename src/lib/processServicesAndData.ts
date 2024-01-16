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
    for (const serviceName of Object.keys(services)) {
        logger.info(`Detecting changes for service: '${serviceName}'`);
        const serviceYaml = services[serviceName];

        for (const image of serviceYaml.images) {
            const previousDigest = previousData[image];
            const currentDigest = data[image];

            if (previousDigest === currentDigest) {
                logger.info(` >> image: ${image} [not changed]`);
                continue;
            }

            logger.info(` >> image: ${image} [CHANGED]`);
            servicesToProcess.push(serviceName);
        }
    }

    if (servicesToProcess.length === 0) {
        logger.info(`No updates needed for all services`);
        return false;
    }
    logger.info(`**************************************`);

    logger.info(`Updates are required for ${servicesToProcess.length} service(s)`);

    for (const serviceName of servicesToProcess) {
        logger.info(`Updating service ${serviceName}`);
        slack.sendSlackMessage(`Updating service ${serviceName}`);
        const serviceYaml = services[serviceName];

        //todo check if we have custom set of commands then use those
        await dockerHelper.runDockerComposePull(
            serviceYaml.dockerCompose ? serviceYaml.dockerCompose : config.getDockerComposeFile(),
            serviceName,
            serviceYaml.cwd,
        );
        await dockerHelper.runDockerComposeBuild(
            serviceYaml.dockerCompose ? serviceYaml.dockerCompose : config.getDockerComposeFile(),
            serviceName,
            serviceYaml.cwd,
        );
        await dockerHelper.runDockerComposeUp(
            serviceYaml.dockerCompose ? serviceYaml.dockerCompose : config.getDockerComposeFile(),
            serviceName,
            serviceYaml.cwd,
        );
        // todo check if we have to push to remote registry commands
        logger.info(`Done updating service ${serviceName}`);
    }

    return true;
}

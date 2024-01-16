"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processServicesAndData = void 0;
const logger_1 = require("./logger");
function processServicesAndData(dependencies, services, data, previousData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { config, dockerHelper, slack } = dependencies;
        const servicesToProcess = [];
        logger_1.logger.info(`**************************************`);
        for (const serviceName of Object.keys(services)) {
            logger_1.logger.info(`Detecting changes for service: '${serviceName}'`);
            const serviceYaml = services[serviceName];
            for (const image of serviceYaml.images) {
                const previousDigest = previousData[image];
                const currentDigest = data[image];
                if (previousDigest === currentDigest) {
                    logger_1.logger.info(` >> image: ${image} [not changed]`);
                    continue;
                }
                logger_1.logger.info(` >> image: ${image} [CHANGED]`);
                servicesToProcess.push(serviceName);
            }
        }
        if (servicesToProcess.length === 0) {
            logger_1.logger.info(`No updates needed for all services`);
            return false;
        }
        logger_1.logger.info(`**************************************`);
        logger_1.logger.info(`Updates are required for ${servicesToProcess.length} service(s)`);
        for (const serviceName of servicesToProcess) {
            logger_1.logger.info(`Updating service ${serviceName}`);
            slack.sendSlackMessage(`Updating service ${serviceName}`);
            const serviceYaml = services[serviceName];
            //todo check if we have custom set of commands then use those
            yield dockerHelper.runDockerComposePull(serviceYaml.dockerCompose ? serviceYaml.dockerCompose : config.getDockerComposeFile(), serviceName, serviceYaml.cwd);
            yield dockerHelper.runDockerComposeBuild(serviceYaml.dockerCompose ? serviceYaml.dockerCompose : config.getDockerComposeFile(), serviceName, serviceYaml.cwd);
            yield dockerHelper.runDockerComposeUp(serviceYaml.dockerCompose ? serviceYaml.dockerCompose : config.getDockerComposeFile(), serviceName, serviceYaml.cwd);
            // todo check if we have to push to remote registry commands
            logger_1.logger.info(`Done updating service ${serviceName}`);
        }
        return true;
    });
}
exports.processServicesAndData = processServicesAndData;

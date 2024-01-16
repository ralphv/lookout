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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const package_json_1 = __importDefault(require("../../package.json"));
const js_yaml_1 = require("js-yaml");
const json_schema_library_1 = require("json-schema-library");
const v1_json_1 = __importDefault(require("../../schemas/v1.json"));
const consolidateImages_1 = require("./consolidateImages");
const processServicesAndData_1 = require("./processServicesAndData");
const LookoutError_1 = __importDefault(require("./LookoutError"));
const utils_1 = require("./utils");
class Main {
    constructor() {
        this.task = null;
    }
    start(dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            const { config, fileServices, slack } = dependencies;
            logger_1.logger.info(`Starting lookout version: ${package_json_1.default.version}`);
            slack.sendSlackMessage(`Starting lookout version: ${package_json_1.default.version}`);
            // 1. pull config
            const yamlFilename = config.getYamlFilename();
            if (!yamlFilename) {
                throw new Error('Missing YAML config file');
            }
            // 2. let's parse it
            const yamlConfigContents = yield fileServices.readFile(yamlFilename);
            const yamlConfigs = (0, js_yaml_1.loadAll)(yamlConfigContents.toString());
            if (yamlConfigs.length !== 1) {
                throw new Error('Single yaml object should exist');
            }
            const yamlConfig = yamlConfigs[0];
            (0, utils_1.processKeys)(yamlConfig);
            // validate schema
            const jsonSchema = new json_schema_library_1.Draft07(v1_json_1.default);
            const errors = jsonSchema.validate(yamlConfig);
            if (errors.length !== 0) {
                throw new LookoutError_1.default(`Invalid config file definition, schema errors`, errors);
            }
            logger_1.logger.log(`Found: ${Object.keys(yamlConfig.services).length} services.`);
            const listOfImages = (0, consolidateImages_1.consolidateImages)(yamlConfig);
            logger_1.logger.debug(`List of images: ${JSON.stringify(listOfImages, null, 2)}`);
            // 3. run an initial cronJob when we start
            yield this.cronJob(dependencies, listOfImages, yamlConfig);
            if (config.scheduleCron()) {
                logger_1.logger.info(`Scheduling cron job with timer: ${config.getCron()}`);
                this.task = utils_1.utils.schedule(config.getCron(), () => {
                    void this.cronJob(dependencies, listOfImages, yamlConfig);
                });
            }
        });
    }
    cronJob(dependencies, listOfImages, yamlConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const { config, registry, fileServices, slack } = dependencies;
            logger_1.logger.info(`----------------------------------------------`);
            logger_1.logger.info(`Starting cron job`);
            slack.sendSlackMessage(`Starting cron job`);
            try {
                // 1. pull digest for each image
                const listOfImageInformation = yield Promise.all(listOfImages.map((image) => registry.getImageInformation(dependencies, image)));
                // 2. produce data object
                const data = listOfImageInformation.reduce((acc, imageInfo) => {
                    if (imageInfo.latestDigest === '') {
                        return acc;
                    }
                    return Object.assign(Object.assign({}, acc), { [imageInfo.fullImageName]: imageInfo.latestDigest });
                }, {});
                logger_1.logger.debug(`Produced data structure: ${JSON.stringify(data, null, 2)}`);
                // 3. load previous data if found, manually update each one only if successful
                if (!(yield fileServices.exists(config.getDataFilename()))) {
                    // fresh new file, save and sleep
                    logger_1.logger.info(`Creating data file for the first time: ${config.getDataFilename()}`);
                    yield fileServices.writeFile(config.getDataFilename(), JSON.stringify(data, null, 2));
                }
                else {
                    // 4. process services now and update as needed
                    const previousDataFileContents = yield fileServices.readFile(config.getDataFilename());
                    const previousData = JSON.parse(previousDataFileContents.toString());
                    if (yield (0, processServicesAndData_1.processServicesAndData)(dependencies, yamlConfig.services, data, previousData)) {
                        //update data file now if we passed all processing //todo could be better
                        logger_1.logger.info(`Updating data file with new digests: ${config.getDataFilename()}`);
                        yield fileServices.writeFile(config.getDataFilename(), JSON.stringify(data, null, 2));
                    }
                }
            }
            catch (error) {
                logger_1.logger.error(`Failed to run cronjob: `, error);
                slack.sendSlackMessage(`Error: Failed to run cronjob`);
            }
            logger_1.logger.info(`Cron job done`);
            slack.sendSlackMessage(`Cron job done`);
            logger_1.logger.info(`----------------------------------------------`);
        });
    }
    stop() {
        if (this.task !== null) {
            this.task.stop();
            this.task = null;
        }
    }
}
exports.default = Main;

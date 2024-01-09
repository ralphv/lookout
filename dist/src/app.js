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
const Config_1 = __importDefault(require("./lib/Config"));
const Registry_1 = __importDefault(require("./lib/Registry"));
const Main_1 = __importDefault(require("./lib/Main"));
const DockerHelper_1 = __importDefault(require("./lib/DockerHelper"));
const FileServices_1 = __importDefault(require("./lib/FileServices"));
const Slack_1 = __importDefault(require("./lib/Slack"));
const logger_1 = require("./lib/logger");
const LookoutError_1 = require("./lib/LookoutError");
// main entry point
void (() => __awaiter(void 0, void 0, void 0, function* () {
    const slack = new Slack_1.default();
    const main = new Main_1.default();
    try {
        yield main.start({
            config: new Config_1.default(),
            dockerHelper: new DockerHelper_1.default(),
            fileServices: new FileServices_1.default(),
            registry: new Registry_1.default(),
            slack,
        });
    }
    catch (error) {
        if ((0, LookoutError_1.isLookoutError)(error)) {
            logger_1.logger.error(`Failed to start: ${error.describe()}`, error);
            slack.sendSlackMessage(`Error: Failed to start: ${error.message}`);
        }
        else {
            logger_1.logger.error(`Failed to start: `, error);
            slack.sendSlackMessage(`Error: Failed to start`);
        }
    }
}))();

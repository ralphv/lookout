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
const utils_1 = require("./utils");
const logger_1 = require("./logger");
const path_1 = __importDefault(require("path"));
const Config_1 = __importDefault(require("./Config"));
class DockerHelper {
    runDockerComposePull(file, service, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand(`${this.getDockerComposeCommand()} --file ${file} pull ${service}`, cwd ? cwd : path_1.default.dirname(file));
        });
    }
    runDockerComposeBuild(file, service, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand(`${this.getDockerComposeCommand()} --file ${file} build ${service}`, cwd ? cwd : path_1.default.dirname(file));
        });
    }
    runDockerComposeUp(file, service, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand(`${this.getDockerComposeCommand()} --file ${file} up -d ${service}`, cwd ? cwd : path_1.default.dirname(file));
        });
    }
    runCommand(cmd, cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                logger_1.logger.debug(`running command: '${cmd}' @ '${cwd}'`);
                const child = utils_1.utils.exec(cmd, {
                    cwd,
                }, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(null);
                    }
                });
                if (child.stdout) {
                    child.stdout.pipe(process.stdout);
                }
                if (child.stderr) {
                    child.stderr.pipe(process.stderr);
                }
                //child.on('close', (code) => {
                //});
            });
        });
    }
    getDockerComposeCommand() {
        const config = new Config_1.default();
        return config.useDockerComposeV2() ? 'docker compose' : 'docker-compose';
    }
}
exports.default = DockerHelper;

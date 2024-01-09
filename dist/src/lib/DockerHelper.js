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
const utils_1 = require("./utils");
class DockerHelper {
    runDockerComposePull(file, service) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand(`docker-compose -f ${file} pull ${service}`);
        });
    }
    runDockerComposeBuild(file, service) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand(`docker-compose -f ${file} build ${service}`);
        });
    }
    runDockerComposeUp(file, service) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand(`docker-compose -f ${file} up -d ${service}`);
        });
    }
    runCommand(cmd) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const cmdParts = cmd.split(' ');
                const child = utils_1.utils.spawn(cmdParts[0], cmdParts.slice(1));
                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stderr);
                child.on('close', (code) => {
                    if (code !== 0) {
                        reject(code);
                    }
                    else {
                        resolve(0);
                    }
                });
            });
        });
    }
}
exports.default = DockerHelper;

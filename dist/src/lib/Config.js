"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV_VARIABLE_PREFIX = void 0;
exports.ENV_VARIABLE_PREFIX = 'LOOKOUT';
class Config {
    getEnvVariable(envName, defaultValue) {
        var _a;
        /* istanbul ignore next */
        return (_a = process.env[envName]) !== null && _a !== void 0 ? _a : defaultValue;
    }
    getBoolEnvVariable(envName, defaultValue) {
        var _a;
        return ((_a = process.env[envName]) !== null && _a !== void 0 ? _a : (defaultValue ? 'TRUE' : 'FALSE')) === 'TRUE';
    }
    getYamlFilename() {
        return this.getEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_CONFIG`, '/config/config.yaml');
    }
    getDataFilename() {
        return this.getEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_DATA`, '/data/data.json');
    }
    getDockerComposeFile() {
        return this.getEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_DOCKER_COMPOSE`, '/config/docker-compose.yaml');
    }
    getLogLevel() {
        return this.getEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_LOG_LEVEL`, 'info');
    }
    getCron() {
        return this.getEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_CRON`, '0 */6 * * *');
    }
    isSendSlackMessages() {
        return this.getBoolEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_SEND_SLACK_MESSAGES`, true);
    }
    getSlackURL() {
        return this.getEnvVariable(`${exports.ENV_VARIABLE_PREFIX}_SLACK_WEBHOOK`, 'https://hooks.slack.com/services/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');
    }
    scheduleCron() {
        return true;
    }
}
exports.default = Config;

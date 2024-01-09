export const ENV_VARIABLE_PREFIX = 'LOOKOUT';
export default class Config {
    private getEnvVariable(envName: string, defaultValue: string): string {
        /* istanbul ignore next */
        return process.env[envName] ?? defaultValue;
    }

    private getBoolEnvVariable(envName: string, defaultValue: boolean): boolean {
        return (process.env[envName] ?? (defaultValue ? 'TRUE' : 'FALSE')) === 'TRUE';
    }

    getYamlFilename() {
        return this.getEnvVariable(`${ENV_VARIABLE_PREFIX}_CONFIG`, '/config/config.yaml');
    }

    getDataFilename() {
        return this.getEnvVariable(`${ENV_VARIABLE_PREFIX}_DATA`, '/data/data.json');
    }

    getDockerComposeFile() {
        return this.getEnvVariable(`${ENV_VARIABLE_PREFIX}_DOCKER_COMPOSE`, '/config/docker-compose.yaml');
    }

    getLogLevel() {
        return this.getEnvVariable(`${ENV_VARIABLE_PREFIX}_LOG_LEVEL`, 'info');
    }

    getCron() {
        return this.getEnvVariable(`${ENV_VARIABLE_PREFIX}_CRON`, '0 */6 * * *');
    }

    isSendSlackMessages(): boolean {
        return this.getBoolEnvVariable(`${ENV_VARIABLE_PREFIX}_SEND_SLACK_MESSAGES`, false);
    }

    getSlackURL(): string {
        return this.getEnvVariable(`${ENV_VARIABLE_PREFIX}_SLACK_WEBHOOK`, '');
    }

    scheduleCron(): boolean {
        return true;
    }
}

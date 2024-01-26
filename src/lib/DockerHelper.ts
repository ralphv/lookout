import { utils } from './utils';
import { logger } from './logger';
import path from 'path';
import Config from './Config';

export default class DockerHelper {
    async runDockerComposePull(file: string, service: string, cwd?: string): Promise<number> {
        return this.runCommand(
            `${this.getDockerComposeCommand()} -f ${file} pull ${service}`,
            cwd ? cwd : path.dirname(file),
        );
    }
    async runDockerComposeBuild(file: string, service: string, cwd?: string): Promise<number> {
        return this.runCommand(
            `${this.getDockerComposeCommand()} -f ${file} build ${service}`,
            cwd ? cwd : path.dirname(file),
        );
    }
    async runDockerComposeUp(file: string, service: string, cwd?: string): Promise<number> {
        return this.runCommand(
            `${this.getDockerComposeCommand()} -f ${file} up -d ${service}`,
            cwd ? cwd : path.dirname(file),
        );
    }

    private async runCommand(cmd: string, cwd: string): Promise<number> {
        return new Promise((resolve, reject) => {
            logger.debug(`running command: '${cmd}' @ '${cwd}'`);
            const cmdParts = cmd.split(' ');
            const child = utils.spawn(cmdParts[0], cmdParts.slice(1), {
                cwd,
            });
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
            child.on('close', (code) => {
                if (code !== 0) {
                    reject(code);
                } else {
                    resolve(0);
                }
            });
        });
    }

    private getDockerComposeCommand() {
        const config = new Config();
        return config.useDockerComposeV2() ? 'docker compose' : 'docker-compose';
    }
}

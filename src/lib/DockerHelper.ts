import { utils } from './utils';
import { logger } from './logger';
import path from 'path';
import Config from './Config';
import { ExecException } from 'child_process';

export default class DockerHelper {
    async runDockerComposePull(file: string, service: string, cwd?: string): Promise<ExecException | null> {
        return this.runCommand(
            `${this.getDockerComposeCommand()} --file ${file} pull ${service}`,
            cwd ? cwd : path.dirname(file),
        );
    }
    async runDockerComposeBuild(file: string, service: string, cwd?: string): Promise<ExecException | null> {
        return this.runCommand(
            `${this.getDockerComposeCommand()} --file ${file} build ${service}`,
            cwd ? cwd : path.dirname(file),
        );
    }
    async runDockerComposeUp(file: string, service: string, cwd?: string): Promise<ExecException | null> {
        return this.runCommand(
            `${this.getDockerComposeCommand()} --file ${file} up -d ${service}`,
            cwd ? cwd : path.dirname(file),
        );
    }

    private async runCommand(cmd: string, cwd: string): Promise<ExecException | null> {
        return new Promise((resolve, reject) => {
            logger.debug(`running command: '${cmd}' @ '${cwd}'`);
            const child = utils.exec(
                cmd,
                {
                    cwd,
                },
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(null);
                    }
                },
            );
            if (child.stdout) {
                child.stdout.pipe(process.stdout);
            }
            if (child.stderr) {
                child.stderr.pipe(process.stderr);
            }
            //child.on('close', (code) => {
            //});
        });
    }

    private getDockerComposeCommand() {
        const config = new Config();
        return config.useDockerComposeV2() ? 'docker compose' : 'docker-compose';
    }
}

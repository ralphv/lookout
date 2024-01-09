import { utils } from './utils';

export default class DockerHelper {
    async runDockerComposePull(file: string, service: string): Promise<number> {
        return this.runCommand(`docker-compose -f ${file} pull ${service}`);
    }
    async runDockerComposeBuild(file: string, service: string): Promise<number> {
        return this.runCommand(`docker-compose -f ${file} build ${service}`);
    }
    async runDockerComposeUp(file: string, service: string): Promise<number> {
        return this.runCommand(`docker-compose -f ${file} up -d ${service}`);
    }

    private async runCommand(cmd: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const cmdParts = cmd.split(' ');
            const child = utils.spawn(cmdParts[0], cmdParts.slice(1));
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
}

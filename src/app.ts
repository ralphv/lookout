import Config from './lib/Config';
import Registry from './lib/Registry';
import Main from './lib/Main';
import DockerHelper from './lib/DockerHelper';
import FileServices from './lib/FileServices';
import Slack from './lib/Slack';
import { logger } from './lib/logger';
import { isLookoutError } from './lib/LookoutError';

// main entry point
void (async () => {
    const slack = new Slack();
    const main = new Main();
    try {
        await main.start({
            config: new Config(),
            dockerHelper: new DockerHelper(),
            fileServices: new FileServices(),
            registry: new Registry(),
            slack,
        });
    } catch (error) {
        if (isLookoutError(error)) {
            logger.error(`Failed to start: ${error.describe()}`, error);
            slack.sendSlackMessage(`Error: Failed to start: ${error.message}`);
        } else {
            logger.error(`Failed to start: `, error);
            slack.sendSlackMessage(`Error: Failed to start`);
        }
    }
})();

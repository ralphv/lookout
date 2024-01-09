import 'mocha';
import Config from '../src/lib/Config';

describe('config', () => {
    it('adding coverage', async () => {
        const config = new Config();
        config.getSlackURL();
        config.isSendSlackMessages();
        config.scheduleCron();
        config.getLogLevel();
        config.getDockerComposeFile();
        config.getDataFilename();
        config.getYamlFilename();
        config.getCron();
    });
});

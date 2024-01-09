import Registry from './Registry';
import DockerHelper from './DockerHelper';
import FileServices from './FileServices';
import Slack from './Slack';
import Config from './Config';

export interface Dependencies {
    config: Config;
    registry: Registry;
    dockerHelper: DockerHelper;
    fileServices: FileServices;
    slack: Slack;
}

import log4js from 'log4js';
import Config from './Config';

const config = new Config();

/*export const getLogger = (name: string) => {
    const l = log4js.getLogger(name);
    l.level = config.getLogLevel();
    return l;
};*/

const l = log4js.getLogger();
l.level = config.getLogLevel();
export const logger = l;

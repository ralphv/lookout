import Config from './Config';
import axios from 'axios';
import { logger } from './logger';

export default class Slack {
    private config: Config;

    constructor(config: Config = new Config()) {
        this.config = config;
    }

    public sendSlackMessage(message: string): void {
        void this.asyncSendSlackMessage(message);
    }

    public async asyncSendSlackMessage(message: string) {
        try {
            if (!this.config.isSendSlackMessages() || !this.config.getSlackURL()) {
                return;
            }
            const response = await axios.post(
                this.config.getSlackURL(),
                {
                    text: message,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            logger.debug(`Slack Response: ${JSON.stringify(response)}`);
        } catch (error) {
            // we ignore slack errors
            logger.debug(`Slack Error`, error);
        }
    }
}

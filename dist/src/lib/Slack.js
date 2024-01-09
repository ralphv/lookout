"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = __importDefault(require("./Config"));
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
class Slack {
    constructor(config = new Config_1.default()) {
        this.config = config;
    }
    sendSlackMessage(message) {
        void this.asyncSendSlackMessage(message);
    }
    asyncSendSlackMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.config.isSendSlackMessages() || !this.config.getSlackURL()) {
                    return;
                }
                const response = yield axios_1.default.post(this.config.getSlackURL(), {
                    text: message,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                logger_1.logger.debug(`Slack Response: ${JSON.stringify(response.data)}`);
            }
            catch (error) {
                // we ignore slack errors
                logger_1.logger.debug(`Slack Error`, error);
            }
        });
    }
}
exports.default = Slack;

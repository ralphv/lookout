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
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("./logger");
class Registry {
    getImageInformation(dependencies, image) {
        return __awaiter(this, void 0, void 0, function* () {
            const registryUrlAndImageName = this.getRegistryUrlAndImageName(image);
            const latestDigest = yield this.getLatestDigest(dependencies, registryUrlAndImageName);
            return Object.assign(Object.assign({}, registryUrlAndImageName), { latestDigest, fullImageName: image });
        });
    }
    getRegistryUrlAndImageName(image) {
        let tag;
        let imageName;
        let registryDomain;
        // get tag
        const tagParts = image.split(':');
        if (tagParts.length === 2) {
            imageName = tagParts[0];
            tag = tagParts[1];
        }
        else {
            imageName = image;
            tag = 'latest';
        }
        // get domain
        const parts = imageName.split('/');
        if (parts.length > 1 && parts[0].includes('.')) {
            registryDomain = `https://${parts[0]}`;
            imageName = parts.slice(1).join('/');
        }
        else {
            registryDomain = 'https://registry.hub.docker.com';
        }
        return {
            registryDomain,
            imageName,
            tag,
        };
    }
    getLatestDigest(dependencies, { registryDomain, imageName, tag }) {
        return __awaiter(this, void 0, void 0, function* () {
            const dockerHubRepo = registryDomain === 'https://registry.hub.docker.com';
            if (dockerHubRepo) {
                return this.getLatestDigestDockerHub(dependencies, { registryDomain, imageName, tag });
            }
            else {
                return this.getLatestDigestPrivate(dependencies, { registryDomain, imageName, tag });
            }
        });
    }
    getLatestDigestDockerHub(dependencies, { registryDomain, imageName, tag }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            //https://registry.hub.docker.com/v2/repositories/{namespace}/{repository}/tags/{tag}
            if (!imageName.includes('/')) {
                imageName = `library/${imageName}`;
            }
            const url = `${registryDomain}/v2/repositories/${imageName}/tags/${tag}`;
            try {
                const response = yield axios_1.default.get(url);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                return ((_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.images[0]) === null || _b === void 0 ? void 0 : _b.digest) || '';
            }
            catch (error) {
                logger_1.logger.error(`Error fetching the image digest from '${registryDomain}' for '${imageName}:${tag}'. url: ${url}`);
                dependencies.slack.sendSlackMessage(`Error fetching the image digest`);
                return '';
            }
        });
    }
    getLatestDigestPrivate(dependencies, { registryDomain, imageName, tag }) {
        return __awaiter(this, void 0, void 0, function* () {
            //https://{custom_registry_domain}/v2/{namespace}/{repository}/manifests/{tag}
            const url = `${registryDomain}/v2/${imageName}/manifests/${tag}`;
            try {
                const response = yield axios_1.default.get(url, {
                    headers: {
                        Accept: 'application/vnd.docker.distribution.manifest.v2+json',
                    },
                });
                return response.headers['docker-content-digest'];
            }
            catch (error) {
                logger_1.logger.error(`Error fetching the image digest from '${registryDomain}' for '${imageName}:${tag}'. url: ${url}`, error);
                dependencies.slack.sendSlackMessage(`Error fetching the image digest`);
                return '';
            }
        });
    }
}
exports.default = Registry;

import axios from 'axios';
import { logger } from './logger';
import { Dependencies } from './Dependencies';

interface RegistryUrlAndImageName {
    registryDomain: string;
    imageName: string;
    tag: string;
}

export interface RegistryInformation extends RegistryUrlAndImageName {
    latestDigest: string;
    fullImageName: string;
}
export default class Registry {
    public async getImageInformation(dependencies: Dependencies, image: string): Promise<RegistryInformation> {
        const registryUrlAndImageName = this.getRegistryUrlAndImageName(image);
        const latestDigest = await this.getLatestDigest(dependencies, registryUrlAndImageName);
        return {
            ...registryUrlAndImageName,
            latestDigest,
            fullImageName: image,
        };
    }

    private getRegistryUrlAndImageName(image: string): RegistryUrlAndImageName {
        let tag: string;
        let imageName: string;
        let registryDomain: string;

        // get tag
        const tagParts = image.split(':');
        if (tagParts.length === 2) {
            imageName = tagParts[0];
            tag = tagParts[1];
        } else {
            imageName = image;
            tag = 'latest';
        }

        // get domain
        const parts = imageName.split('/');
        if (parts.length > 1 && parts[0].includes('.')) {
            registryDomain = `https://${parts[0]}`;
            imageName = parts.slice(1).join('/');
        } else {
            registryDomain = 'https://registry.hub.docker.com';
        }

        return {
            registryDomain,
            imageName,
            tag,
        };
    }

    private async getLatestDigest(
        dependencies: Dependencies,
        { registryDomain, imageName, tag }: RegistryUrlAndImageName,
    ): Promise<string> {
        const dockerHubRepo = registryDomain === 'https://registry.hub.docker.com';
        if (dockerHubRepo) {
            return this.getLatestDigestDockerHub(dependencies, { registryDomain, imageName, tag });
        } else {
            return this.getLatestDigestPrivate(dependencies, { registryDomain, imageName, tag });
        }
    }

    private async getLatestDigestDockerHub(
        dependencies: Dependencies,
        { registryDomain, imageName, tag }: RegistryUrlAndImageName,
    ) {
        //https://registry.hub.docker.com/v2/repositories/{namespace}/{repository}/tags/{tag}
        if (!imageName.includes('/')) {
            imageName = `library/${imageName}`;
        }

        const url = `${registryDomain}/v2/repositories/${imageName}/tags/${tag}`;

        try {
            const response = await axios.get(url);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return response?.data?.images[0]?.digest || '';
        } catch (error) {
            logger.error(
                `Error fetching the image digest from '${registryDomain}' for '${imageName}:${tag}'. url: ${url}`,
            );
            dependencies.slack.sendSlackMessage(`Error fetching the image digest`);
            return '';
        }
    }

    private async getLatestDigestPrivate(
        dependencies: Dependencies,
        { registryDomain, imageName, tag }: RegistryUrlAndImageName,
    ) {
        //https://{custom_registry_domain}/v2/{namespace}/{repository}/manifests/{tag}

        const url = `${registryDomain}/v2/${imageName}/manifests/${tag}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: 'application/vnd.docker.distribution.manifest.v2+json',
                },
            });
            return response.headers['docker-content-digest'];
        } catch (error) {
            logger.error(
                `Error fetching the image digest from '${registryDomain}' for '${imageName}:${tag}'. url: ${url}`,
                error,
            );
            dependencies.slack.sendSlackMessage(`Error fetching the image digest`);
            return '';
        }
    }
}

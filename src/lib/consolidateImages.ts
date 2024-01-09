import { YamlConfiguration, YamlConfigurationService } from './YamlConfiguration';
//import { logger } from './logger';

export function consolidateImages(yamlConfig: YamlConfiguration): string[] {
    const set: Set<string> = Object.values(yamlConfig.services).reduce(
        (accumulator, value: YamlConfigurationService) => {
            return new Set<string>([...accumulator, ...value.images]);
        },
        new Set<string>(),
    );
    return [...set];
}

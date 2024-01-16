export interface YamlConfiguration {
    version: string;
    services: Record<string, YamlConfigurationService>;
}

export interface YamlConfigurationService {
    images: string[];
    commands?: string[];
    dockerCompose?: string;
    cwd?: string;
}

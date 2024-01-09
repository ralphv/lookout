export interface YamlConfiguration {
    version: string;
    services: Record<string, YamlConfigurationService>;
}

export interface YamlConfigurationService {
    images: string[];
    commands?: string[];
}

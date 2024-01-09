import Config from '../src/lib/Config';
import { instance, mock, when, anything } from 'ts-mockito';
import Registry from '../src/lib/Registry';
import DockerHelper from '../src/lib/DockerHelper';
import FileServices from '../src/lib/FileServices';
import Slack from '../src/lib/Slack';
import { Dependencies } from '../src/lib/Dependencies';
import { expect } from 'chai';

export const getDependenciesMocks = () => {
    let configMock: Config = mock(Config);
    let registryMock: Registry = mock(Registry);
    let dockerHelperMock: DockerHelper = mock(DockerHelper);
    let fileServicesMock: FileServices = mock(FileServices);
    let slackMock: Slack = mock(Slack);

    // config
    when(configMock.getYamlFilename()).thenReturn('yaml-file');
    when(configMock.getDataFilename()).thenReturn('data-file');
    when(configMock.getDockerComposeFile()).thenReturn('docker-compose-file');
    when(configMock.getLogLevel()).thenReturn('debug');
    when(configMock.getCron()).thenReturn('0 */6 * * *');
    when(configMock.isSendSlackMessages()).thenReturn(false);
    when(configMock.scheduleCron()).thenReturn(false);

    // file services
    when(fileServicesMock.readFile('yaml-file')).thenResolve(`
version: '1.0'
services:
  simple-node-express:
    images:
      - node
`);

    // registry
    when(registryMock.getImageInformation(anything(), 'node')).thenResolve({
        fullImageName: 'node',
        imageName: 'node',
        latestDigest: 'latest-abc',
        registryDomain: 'https://registry.hub.docker.com',
        tag: 'latest',
    });

    return {
        configMock,
        registryMock,
        dockerHelperMock,
        fileServicesMock,
        slackMock,
    };
};
export const getDependencies = (mocks: any): Dependencies => {
    return {
        config: instance(mocks.configMock),
        dockerHelper: instance(mocks.dockerHelperMock),
        fileServices: instance(mocks.fileServicesMock),
        registry: instance(mocks.registryMock),
        slack: instance(mocks.slackMock),
    };
};

export const expectThrowsAsync = async (method: () => Promise<unknown>, errorMessage?: string) => {
    let error = null;
    try {
        await method();
    } catch (err) {
        error = err;
    }
    expect(error).to.be.an('Error');
    if (errorMessage) {
        expect((error as Error).message).to.equal(errorMessage);
    }
};

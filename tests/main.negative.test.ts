import 'mocha';
import { expect } from 'chai';
import Main from '../src/lib/Main';
import { expectThrowsAsync, getDependencies, getDependenciesMocks } from './utils';
import { anything, capture, spy, when } from 'ts-mockito';
import { logger } from '../src/lib/logger';
import { verify } from 'crypto';
import { Logger } from 'log4js';

describe('main negative', () => {
    it('missing yaml file config', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.configMock.getYamlFilename()).thenReturn('');

        const dependencies = getDependencies(mocks);

        const main = new Main();
        await expectThrowsAsync(() => main.start(dependencies), 'Missing YAML config file');
    });
    it('multi element yaml file config', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.fileServicesMock.readFile('yaml-file')).thenResolve(`
version: '1.0'
services:
  simple-node-express:
    images:
      - node
---
version: '1.0'
services:
  simple-node-express:
    images:
      - node
`);
        const dependencies = getDependencies(mocks);

        const main = new Main();
        await expectThrowsAsync(() => main.start(dependencies), 'Single yaml object should exist');
    });
    it('empty yaml file config', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.fileServicesMock.readFile('yaml-file')).thenResolve(``);
        const dependencies = getDependencies(mocks);

        const main = new Main();
        await expectThrowsAsync(() => main.start(dependencies), 'Single yaml object should exist');
    });
    it('invalid schema of yaml file config', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.fileServicesMock.readFile('yaml-file')).thenResolve(`
version: '1.0'
services:
  simple-node-express:
`);
        const dependencies = getDependencies(mocks);

        const main = new Main();
        await expectThrowsAsync(() => main.start(dependencies), 'Invalid config file definition, schema errors');
    });
    it('empty latest digest', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.registryMock.getImageInformation(anything(), 'node')).thenResolve({
            fullImageName: 'node',
            imageName: 'node',
            latestDigest: '',
            registryDomain: 'https://registry.hub.docker.com',
            tag: 'latest',
        });
        const dependencies = getDependencies(mocks);

        const main = new Main();
        await main.start(dependencies);
    });
    it('getImageInformation throwing error', async () => {
        const spiedLogger = spy(logger);

        // silence error on console
        when(spiedLogger.error(anything(), anything())).thenCall(() => {});

        const mocks = getDependenciesMocks();

        const errorToThrow = new Error('failed to get information');
        when(mocks.registryMock.getImageInformation(anything(), 'node')).thenThrow(errorToThrow);
        const dependencies = getDependencies(mocks);

        const main = new Main();
        await main.start(dependencies);

        expect(capture(spiedLogger.error).last()).to.deep.equal(['Failed to run cronjob: ', errorToThrow]);
    });
});

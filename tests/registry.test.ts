import 'mocha';
import Registry from '../src/lib/Registry';
import { getDependencies, getDependenciesMocks } from './utils';
import { expect } from 'chai';
import { anything, capture, spy, when } from 'ts-mockito';
import { logger } from '../src/lib/logger';
import axios from 'axios';

describe('registry', () => {
    it('test node', async () => {
        const registry = new Registry();
        const result = await registry.getImageInformation(getDependencies(getDependenciesMocks()), 'node');
        expect(result.registryDomain).to.equal('https://registry.hub.docker.com');
    });
    it('test node with tag', async () => {
        const registry = new Registry();
        const result = await registry.getImageInformation(getDependencies(getDependenciesMocks()), 'node:latest');
        expect(result.registryDomain).to.equal('https://registry.hub.docker.com');
    });
    it('test n8n', async () => {
        const registry = new Registry();
        const result = await registry.getImageInformation(
            getDependencies(getDependenciesMocks()),
            'docker.n8n.io/n8nio/n8n',
        );
        expect(result.registryDomain).to.equal('https://docker.n8n.io');
    });
    it('test node with error', async () => {
        const spiedLogger = spy(logger);
        when(spiedLogger.error(anything(), anything())).thenCall((): void => {});

        const spiedAxios = spy(axios);
        when(spiedAxios.get(anything())).thenThrow(new Error('http failed'));

        const registry = new Registry();
        await registry.getImageInformation(getDependencies(getDependenciesMocks()), 'node');

        expect(capture(spiedLogger.error).last()).to.deep.equal([
            "Error fetching the image digest from 'https://registry.hub.docker.com' for 'library/node:latest'. url: https://registry.hub.docker.com/v2/repositories/library/node/tags/latest",
        ]);
    });
    it('test n8n with error', async () => {
        const spiedLogger = spy(logger);
        when(spiedLogger.error(anything(), anything())).thenCall((): void => {});

        const spiedAxios = spy(axios);
        const toThrow = new Error('http failed');
        when(spiedAxios.get(anything(), anything())).thenThrow(toThrow);

        const registry = new Registry();
        await registry.getImageInformation(getDependencies(getDependenciesMocks()), 'docker.n8n.io/n8nio/n8n');

        expect(capture(spiedLogger.error).last()).to.deep.equal([
            "Error fetching the image digest from 'https://docker.n8n.io' for 'n8nio/n8n:latest'. url: https://docker.n8n.io/v2/n8nio/n8n/manifests/latest",
            toThrow,
        ]);
    });
});

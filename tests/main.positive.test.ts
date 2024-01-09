import 'mocha';
import { expect } from 'chai';
import Main from '../src/lib/Main';
import { getDependencies, getDependenciesMocks } from './utils';
import { anything, spy, when } from 'ts-mockito';
import { utils } from '../src/lib/utils';

describe('main', () => {
    it('sample use case, create new data doc', async () => {
        const dependencies = getDependencies(getDependenciesMocks());
        expect(async () => {
            const main = new Main();
            await main.start(dependencies);
        }).to.not.throw();
    });
    it('sample use case, existing data doc, matching digest', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.fileServicesMock.exists('data-file')).thenResolve(true);
        when(mocks.fileServicesMock.readFile('data-file')).thenResolve(`{
  "node": "something"
}`);
        when(mocks.registryMock.getImageInformation(anything(), 'node')).thenResolve({
            fullImageName: 'node',
            imageName: '',
            latestDigest: 'something',
            registryDomain: '',
            tag: '',
        });

        const dependencies = getDependencies(mocks);
        expect(async () => {
            const main = new Main();
            await main.start(dependencies);
        }).to.not.throw();
    });
    it('sample use case, existing data doc, non matching digest', async () => {
        const mocks = getDependenciesMocks();

        when(mocks.fileServicesMock.exists('data-file')).thenResolve(true);
        when(mocks.fileServicesMock.readFile('data-file')).thenResolve(`{
  "node": "something"
}`);
        when(mocks.registryMock.getImageInformation(anything(), 'node')).thenResolve({
            fullImageName: 'node',
            imageName: '',
            latestDigest: 'something-else',
            registryDomain: '',
            tag: '',
        });

        const dependencies = getDependencies(mocks);
        expect(async () => {
            const main = new Main();
            await main.start(dependencies);
        }).to.not.throw();
    });
    it('sample use case, schedule cron', async () => {
        const dependenciesMocks = getDependenciesMocks();
        when(dependenciesMocks.configMock.scheduleCron()).thenReturn(true);
        const dependencies = getDependencies(dependenciesMocks);
        expect(async () => {
            const main = new Main();
            await main.start(dependencies);
            main.stop();
        }).to.not.throw();
    });
    it('sample use case, schedule cron and call immediately', async () => {
        const spied = spy(utils);
        when(spied.schedule(anything(), anything())).thenCall((cron: string, method: () => {}) => {
            method();
        });

        const dependenciesMocks = getDependenciesMocks();
        when(dependenciesMocks.configMock.scheduleCron()).thenReturn(true);
        const dependencies = getDependencies(dependenciesMocks);
        expect(async () => {
            const main = new Main();
            await main.start(dependencies);
        }).to.not.throw();
    });
});

import Slack from '../src/lib/Slack';
import { anything, capture, spy, when } from 'ts-mockito';
import axios, { AxiosResponse } from 'axios';
import { expectThrowsAsync, getDependencies, getDependenciesMocks } from './utils';
import { logger } from '../src/lib/logger';
import { expect } from 'chai';

describe('slack', () => {
    it('test slack', async () => {
        const spiedAxios = spy(axios);
        when(spiedAxios.post(anything(), anything(), anything())).thenResolve({} as unknown as AxiosResponse);

        const slack = new Slack();
        slack.sendSlackMessage('testing');
    });
    it('throw error', async () => {
        const spiedAxios = spy(axios);
        const errorToThrow = new Error('http error');
        when(spiedAxios.post(anything(), anything(), anything())).thenThrow(errorToThrow);

        const spiedLogger = spy(logger);
        when(spiedLogger.debug(anything())).thenCall(() => {});

        const slack = new Slack();
        await slack.asyncSendSlackMessage('testing');

        expect(capture(spiedLogger.debug).last()).to.deep.equal(['Slack Error', errorToThrow]);
    });
    it('disable send', async () => {
        const slack = new Slack(getDependencies(getDependenciesMocks()).config);
        await slack.asyncSendSlackMessage('testing');
    });
});

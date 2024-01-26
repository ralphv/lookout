import { anything, spy, when } from 'ts-mockito';
import DockerHelper from '../src/lib/DockerHelper';
import { expect } from 'chai';
import { utils } from '../src/lib/utils';

describe('docker helper', () => {
    it('docker compose', async () => {
        const spied = spy(utils);
        let methodAttached: any = null;
        when(spied.exec(anything(), anything())).thenCall(
            () =>
                ({
                    stdout: {
                        pipe: () => {},
                    },
                    stderr: {
                        pipe: () => {},
                    },
                    on: (a: string, method: (code: number) => {}) => {
                        methodAttached = method;
                    },
                }) as unknown,
        );

        const dockerHelper = new DockerHelper();
        void dockerHelper.runDockerComposeUp('file', 'service');
        expect(methodAttached).is.not.equal(null);
        if (methodAttached !== null) {
            methodAttached(0);
        }
    });
    it('docker pull', async () => {
        const spied = spy(utils);
        let methodAttached: any = null;
        when(spied.exec(anything(), anything())).thenCall(
            () =>
                ({
                    stdout: {
                        pipe: () => {},
                    },
                    stderr: {
                        pipe: () => {},
                    },
                    on: (a: string, method: (code: number) => {}) => {
                        methodAttached = method;
                    },
                }) as unknown,
        );

        const dockerHelper = new DockerHelper();
        void dockerHelper.runDockerComposePull('file', 'service');
        expect(methodAttached).is.not.equal(null);
        if (methodAttached !== null) {
            methodAttached(0);
        }
    });
    it('docker build', async () => {
        const spied = spy(utils);
        let methodAttached: any = null;
        when(spied.exec(anything(), anything())).thenCall(
            () =>
                ({
                    stdout: {
                        pipe: () => {},
                    },
                    stderr: {
                        pipe: () => {},
                    },
                    on: (a: string, method: (code: number) => {}) => {
                        methodAttached = method;
                    },
                }) as unknown,
        );

        const dockerHelper = new DockerHelper();
        void dockerHelper.runDockerComposeBuild('file', 'service');
        expect(methodAttached).is.not.equal(null);
        if (methodAttached !== null) {
            methodAttached(0);
        }
    });
    it('docker compose failing', async () => {
        const spied = spy(utils);
        let methodAttached: any = null;
        when(spied.exec(anything(), anything())).thenCall(
            () =>
                ({
                    stdout: {
                        pipe: () => {},
                    },
                    stderr: {
                        pipe: () => {},
                    },
                    on: (a: string, method: (code: number) => {}) => {
                        methodAttached = method;
                    },
                }) as unknown,
        );

        const dockerHelper = new DockerHelper();
        void dockerHelper.runDockerComposeBuild('file', 'service');
        expect(methodAttached).is.not.equal(null);
        if (methodAttached !== null) {
            methodAttached(1);
        }
    });
});

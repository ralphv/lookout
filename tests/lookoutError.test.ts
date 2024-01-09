import { anything, spy, when } from 'ts-mockito';
import DockerHelper from '../src/lib/DockerHelper';
import { expect } from 'chai';
import { utils } from '../src/lib/utils';
import LookoutError, { isLookoutError } from '../src/lib/LookoutError';

describe('Lookout error', () => {
    it('adding coverage', async () => {
        const error = new LookoutError('message', {});
        expect(isLookoutError(error)).to.be.true;
        expect(error.describe()).to.be.equal('message: message. payload: {}');
    });
});

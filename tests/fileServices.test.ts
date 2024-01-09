import { expect } from 'chai';
import FileServices from '../src/lib/FileServices';
import * as fs from 'fs';

describe('file services', () => {
    it('test all three', async () => {
        try {
            const fileServices = new FileServices();

            await fileServices.writeFile('temp', 'sample');
            const success = await fileServices.exists('temp');
            expect(success).to.be.true;
            const contents = await fileServices.readFile('temp');
            expect(contents).to.be.equal('sample');
        } finally {
            fs.unlinkSync('temp');
        }
    });
});

import * as fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);

export default class FileServices {
    async readFile(filename: string): Promise<string> {
        return (await readFile(filename)).toString();
    }

    async writeFile(filename: string, contents: string): Promise<void> {
        return writeFile(filename, contents);
    }

    async exists(filename: string): Promise<boolean> {
        return exists(filename);
    }
}

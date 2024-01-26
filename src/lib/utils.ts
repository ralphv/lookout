import * as child_process from 'child_process';
import * as cron from 'node-cron';

// for easier testing
export const utils = {
    exec: child_process.exec,
    schedule: cron.schedule,
};

export function processKeys(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
        return;
    }
    Object.keys(obj).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        processKeys(obj[key]);
        if (key === key.toLowerCase() && key.includes('-')) {
            const camelCaseKey = toCamelCase(key);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            obj[camelCaseKey] = obj[key];
        }
    });
}

function toCamelCase(str: string) {
    return str.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
}

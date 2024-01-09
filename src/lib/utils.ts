import * as child_process from 'child_process';
import * as cron from 'node-cron';

// for easier testing
export const utils = {
    spawn: child_process.spawn,
    schedule: cron.schedule,
};

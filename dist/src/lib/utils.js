"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processKeys = exports.utils = void 0;
const child_process = __importStar(require("child_process"));
const cron = __importStar(require("node-cron"));
// for easier testing
exports.utils = {
    exec: child_process.exec,
    schedule: cron.schedule,
};
function processKeys(obj) {
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
exports.processKeys = processKeys;
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
}

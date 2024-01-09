"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consolidateImages = void 0;
//import { logger } from './logger';
function consolidateImages(yamlConfig) {
    const set = Object.values(yamlConfig.services).reduce((accumulator, value) => {
        return new Set([...accumulator, ...value.images]);
    }, new Set());
    return [...set];
}
exports.consolidateImages = consolidateImages;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLookoutError = void 0;
class LookoutError extends Error {
    constructor(message, payload) {
        super(message);
        this.payload = payload;
        this.payload = payload;
    }
    getPayload() {
        return this.payload;
    }
    describe() {
        return `message: ${this.message}. payload: ${JSON.stringify(this.getPayload())}`;
    }
}
exports.default = LookoutError;
const isLookoutError = (a) => {
    return a !== null && typeof a === 'object' && a.constructor.name === LookoutError.name;
};
exports.isLookoutError = isLookoutError;

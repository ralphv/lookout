export default class LookoutError extends Error {
    constructor(
        message: string,
        private readonly payload?: any,
    ) {
        super(message);
        this.payload = payload;
    }

    getPayload() {
        return this.payload;
    }

    describe() {
        return `message: ${this.message}. payload: ${JSON.stringify(this.getPayload())}`;
    }
}

export const isLookoutError = (a: unknown): a is LookoutError => {
    return a !== null && typeof a === 'object' && a.constructor.name === LookoutError.name;
};

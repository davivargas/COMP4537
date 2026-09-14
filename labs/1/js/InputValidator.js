/*
 * COMP 4537 - Lab 1: Memory Game
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// Checks that the user's input is a whole number within the allowed range.
export class InputValidator {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    isValid(rawValue) {
        const trimmed = rawValue.trim();
        const number = Number(trimmed);
        return trimmed !== ""
            && Number.isInteger(number)
            && number >= this.min
            && number <= this.max;
    }
}

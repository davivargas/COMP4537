/*
 * COMP 4537 - Lab 1: Memory Game
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// Moves buttons to random spots that stay inside the current browser window.
export class ButtonScrambler {
    constructor() {
        this.windowWidth = 0;
        this.windowHeight = 0;
    }

    // Reads the visible window size (clientWidth/clientHeight do not include scrollbars)
    readWindowSize() {
        this.windowWidth = document.documentElement.clientWidth;
        this.windowHeight = document.documentElement.clientHeight;
    }

    // Random whole number from 0 to max, inclusive
    randomUpTo(max) {
        return Math.floor(Math.random() * (max + 1));
    }

    scramble(buttons) {
        this.readWindowSize();
        buttons.forEach((button) => {
            // The furthest a button's top-left corner can go while the whole button stays visible
            const maxLeft = Math.max(0, this.windowWidth - button.getWidth());
            const maxTop = Math.max(0, this.windowHeight - button.getHeight());
            button.moveTo(this.randomUpTo(maxLeft), this.randomUpTo(maxTop));
        });
    }
}

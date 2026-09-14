/*
 * COMP 4537 - Lab 1: Memory Game
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { MESSAGES } from "../lang/messages/en/user.js";
import { MemoryButton } from "./MemoryButton.js";

// Runs one game at a time: creates buttons, times the scrambles and checks the user's clicks.
export class MemoryGame {
    // Game settings. Static, so they belong to the class itself and are not global.
    static MIN_BUTTONS = 3;
    static MAX_BUTTONS = 7;
    static MS_PER_SECOND = 1000;
    static SCRAMBLE_INTERVAL_MS = 2000;
    static FIRST_ORDER = 1;

    constructor(ui, validator, scrambler) {
        this.ui = ui;
        this.validator = validator;
        this.scrambler = scrambler;
        this.buttons = [];
        this.timeoutIds = [];
        this.nextExpectedOrder = MemoryGame.FIRST_ORDER;
    }

    start() {
        this.ui.build(this.validator.min, this.validator.max);
        this.ui.onGo(() => this.handleGo());
    }

    handleGo() {
        const value = this.ui.getInputValue();
        this.reset();

        if (!this.validator.isValid(value)) {
            this.ui.showError(MESSAGES.ERROR_INVALID_NUMBER);
            return;
        }

        this.newGame(Number(value));
    }

    // Removes buttons from the screen and from memory, and cancels any pending timers
    reset() {
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.timeoutIds = [];
        this.buttons.forEach((button) => button.remove());
        this.buttons = [];
        this.nextExpectedOrder = MemoryGame.FIRST_ORDER;
        this.ui.clearMessage();
    }

    newGame(count) {
        this.createButtons(count);
        this.ui.showMessage(MESSAGES.MEMORIZE);
        // Pause n seconds, then scramble n times
        this.schedule(() => this.scramble(count), count * MemoryGame.MS_PER_SECOND);
    }

    createButtons(count) {
        for (let order = MemoryGame.FIRST_ORDER; order <= count; order++) {
            const button = new MemoryButton(order);
            button.onClick((clickedButton) => this.handleButtonClick(clickedButton));
            this.buttons.push(button);
            this.ui.addButton(button);
        }
    }

    // setTimeout wrapper that remembers the id so reset() can cancel it
    schedule(callback, delayMs) {
        this.timeoutIds.push(setTimeout(callback, delayMs));
    }

    // Scrambles once, then schedules the next scramble 2 seconds later until none remain
    scramble(remaining) {
        this.ui.showMessage(MESSAGES.SCRAMBLING);
        this.scrambler.scramble(this.buttons);

        if (remaining > 1) {
            this.schedule(() => this.scramble(remaining - 1), MemoryGame.SCRAMBLE_INTERVAL_MS);
        } else {
            this.startRecall();
        }
    }

    // Scrambling is done: hide the numbers and let the user click
    startRecall() {
        this.buttons.forEach((button) => {
            button.hideNumber();
            button.enable();
        });
        this.ui.showMessage(MESSAGES.YOUR_TURN);
    }

    handleButtonClick(button) {
        if (button.order !== this.nextExpectedOrder) {
            this.buttons.forEach((b) => b.showNumber());
            this.endGame();
            this.ui.showError(MESSAGES.WRONG_ORDER);
            return;
        }

        // Correct: reveal this number and stop it from being clicked again
        button.showNumber();
        button.disable();
        this.nextExpectedOrder++;

        if (this.nextExpectedOrder > this.buttons.length) {
            this.endGame();
            this.ui.showMessage(MESSAGES.EXCELLENT_MEMORY);
        }
    }

    endGame() {
        this.buttons.forEach((button) => button.disable());
    }
}

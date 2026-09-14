/*
 * COMP 4537 - Lab 1: Memory Game
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { MemoryGame } from "./MemoryGame.js";
import { UserInterface } from "./UserInterface.js";
import { InputValidator } from "./InputValidator.js";
import { ButtonScrambler } from "./ButtonScrambler.js";

// Starting point
new MemoryGame(
    new UserInterface(document.body),
    new InputValidator(MemoryGame.MIN_BUTTONS, MemoryGame.MAX_BUTTONS),
    new ButtonScrambler()
).start();

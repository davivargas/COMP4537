/*
 * COMP 4537 - Lab 1: Memory Game
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

import { MESSAGES } from "../lang/messages/en/user.js";

// Builds the page elements and shows messages. It has no game logic.
export class UserInterface {
    constructor(root) {
        this.root = root;
        this.heading = document.createElement("h1");
        this.form = document.createElement("form");
        this.label = document.createElement("label");
        this.input = document.createElement("input");
        this.goButton = document.createElement("button");
        this.message = document.createElement("div");
        this.buttonRow = document.createElement("div");
    }

    // min and max limit the number input's arrows to the allowed button count
    build(min, max) {
        document.title = MESSAGES.PAGE_TITLE;
        this.heading.textContent = MESSAGES.HEADING;

        this.label.textContent = MESSAGES.INPUT_LABEL;
        this.label.htmlFor = "buttonCount";

        this.input.id = "buttonCount";
        this.input.type = "number";
        this.input.min = min;
        this.input.max = max;

        this.goButton.type = "submit";
        this.goButton.textContent = MESSAGES.GO_BUTTON;

        this.form.className = "controls";
        this.form.noValidate = true; // our InputValidator shows the error instead of the browser
        this.form.append(this.label, this.input, this.goButton);

        this.message.className = "message";
        this.buttonRow.className = "button-row";

        this.root.append(this.heading, this.form, this.message, this.buttonRow);
    }

    // Runs handler when Go is clicked (or Enter is pressed in the input)
    onGo(handler) {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault(); // stop the form from reloading the page
            handler();
        });
    }

    getInputValue() {
        return this.input.value;
    }

    showMessage(text) {
        this.message.classList.remove("error");
        this.message.textContent = text;
    }

    showError(text) {
        this.message.classList.add("error");
        this.message.textContent = text;
    }

    clearMessage() {
        this.showMessage("");
    }

    addButton(memoryButton) {
        this.buttonRow.appendChild(memoryButton.element);
    }
}

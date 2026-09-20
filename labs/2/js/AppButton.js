/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// One button in the app. Every button on every page is an instance of this class,
// so no page ever builds a <button> element by hand.
export class AppButton {
    constructor(label, className) {
        this.element = document.createElement("button");
        this.element.type = "button";
        this.element.className = className;
        this.element.textContent = label;
    }

    // Runs handler whenever this button is clicked
    onClick(handler) {
        this.element.addEventListener("click", handler);
    }

    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    remove() {
        this.element.remove();
    }
}

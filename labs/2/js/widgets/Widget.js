/*
 * COMP 4537 - Lab 2: JSON, Object Constructor, localStorage
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// Anything that owns one element on the page. Every widget needs the same three
// things: an element, a way to put it somewhere and a way to take it out again,
// so they all inherit them from here instead of repeating them.
export class Widget {
    constructor(tagName, className) {
        this.element = document.createElement(tagName);
        this.element.className = className;
    }

    // Returns this, so a widget can be created and placed in one expression
    mount(parent) {
        parent.appendChild(this.element);
        return this;
    }

    remove() {
        this.element.remove();
    }
}

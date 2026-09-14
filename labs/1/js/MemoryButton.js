/*
 * COMP 4537 - Lab 1: Memory Game
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

// One colored button in the game. It knows its original order and how to display itself.
export class MemoryButton {
    // Color settings. Static, so they belong to the class itself and are not global.
    static MAX_COLOR_VALUE = 0xFFFFFF;
    static HEX_BASE = 16;
    static HEX_LENGTH = 6;

    constructor(order) {
        this.order = order;
        this.color = this.generateRandomColor();
        this.element = document.createElement("button");
        this.element.type = "button";
        this.element.className = "memory-button";
        this.element.style.backgroundColor = this.color;
        this.showNumber();
        this.disable();
    }

    // Picks a random number from 0x000000 to 0xFFFFFF and formats it as "#rrggbb"
    generateRandomColor() {
        const value = Math.floor(Math.random() * (MemoryButton.MAX_COLOR_VALUE + 1));
        const hex = value.toString(MemoryButton.HEX_BASE).padStart(MemoryButton.HEX_LENGTH, "0");
        return "#" + hex;
    }

    showNumber() {
        this.element.textContent = this.order;
    }

    hideNumber() {
        this.element.textContent = "";
    }

    enable() {
        this.element.disabled = false;
    }

    disable() {
        this.element.disabled = true;
    }

    // Calls handler with this MemoryButton whenever its element is clicked
    onClick(handler) {
        this.element.addEventListener("click", () => handler(this));
    }

    getWidth() {
        return this.element.offsetWidth;
    }

    getHeight() {
        return this.element.offsetHeight;
    }

    // Takes the button out of the row and places it at (left, top) inside the window
    moveTo(left, top) {
        this.element.classList.add("scrambled");
        this.element.style.left = left + "px";
        this.element.style.top = top + "px";
    }

    remove() {
        this.element.remove();
    }
}

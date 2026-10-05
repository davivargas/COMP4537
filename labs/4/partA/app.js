/*
 * COMP 4537 - Lab 4: Part A, debugging
 * AI disclosure: this file was written with the help of Claude (Anthropic), an AI assistant.
 */

const MathOps = require("./math");

// Calls the math module so there is something to step through in the debugger
class DebugApp {
    static NAME = "Davi";

    constructor() {
        this.math = new MathOps();
    }

    run() {
        const a = 7;
        const b = 3;
        const sum = this.math.add(a, b);
        const difference = this.math.subtract(a, b);

        // Place the breakpoint on the line below
        console.log(`Hello ${DebugApp.NAME}! ${a} + ${b} = ${sum}, ${a} - ${b} = ${difference}`);
    }
}

new DebugApp().run();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopWatch = void 0;
const application = require("./application");
class StopWatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.running = false;
    }
    Start() {
        if (this.running)
            return;
        this.Reset();
        this.startTime = Date.now() - this.elapsedTime;
        this.running = true;
    }
    Stop(message = 'Completed build in ') {
        if (!this.running)
            return;
        this.elapsedTime = Date.now() - this.startTime;
        this.running = false;
        this.display(message); // Show final time
    }
    Reset() {
        this.running = false;
        this.elapsedTime = 0;
        this.startTime = 0;
    }
    display(message) {
        // Calculate elapsed time
        const time = this.running ? Date.now() - this.startTime : this.elapsedTime;
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        // Format message
        let finalMessage = message;
        if (minutes > 0)
            finalMessage += `${minutes} minute${minutes !== 1 ? 's' : ''} and `;
        finalMessage += `${this.pad(seconds, (minutes > 0 ? 2 : 1))} second${seconds !== 1 ? 's' : ''}`;
        // Output
        application.WriteToCompilerTerminal();
        application.WriteToCompilerTerminal(finalMessage);
    }
    pad(num, size = 2) {
        return num.toString().padStart(size, '0');
    }
}
exports.StopWatch = StopWatch;
//# sourceMappingURL=stopwatch.js.map
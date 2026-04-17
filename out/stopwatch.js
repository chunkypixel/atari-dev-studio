"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopWatch = void 0;
const application = __importStar(require("./application"));
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
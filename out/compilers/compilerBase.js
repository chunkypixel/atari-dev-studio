"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const execute_1 = require("../execute");
const stream_1 = require("stream");
const cp = require("child_process");
const os = require("os");
class CompilerBase {
    constructor(compilerName, compilerExtensions) {
        // features
        this.isRunning = false;
        this.channelName = "compiler";
        this.outputChannel = vscode.window.createOutputChannel(this.channelName);
        this.CompilerName = compilerName;
        this.CompilerExtensions = compilerExtensions;
    }
    dispose() {
        console.log('debugger:compilerBase.dispose');
    }
    BuildGameAsync(fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
            //return await this.launchEmulatorAsync();
        });
    }
    BuildGameAndRunAsync(fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    launchEmulatorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // options
            let output = new stream_1.Writable();
            let command = "path";
            let args = [
                "arg1"
            ];
            let env = {};
            // Process
            this.outputChannel.appendLine('Launching emulator...');
            let result = yield execute_1.ExecuteCommand(output, command, args, env, "path");
            // Return
            return result;
        });
    }
}
exports.CompilerBase = CompilerBase;
//# sourceMappingURL=compilerBase.js.map
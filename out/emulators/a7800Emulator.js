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
const path = require("path");
const application = require("../application");
const execute = require("../execute");
const emulatorBase_1 = require("./emulatorBase");
class A7800Emulator extends emulatorBase_1.EmulatorBase {
    constructor() {
        super("A7800", "A7800", path.join(application.Path, "out", "bin", "emulators", "a7800"));
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:A7800Emulator.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result)
                return false;
            // Emulator
            if (!this.CustomFolderOrPath) {
                // NOTE: currently Linux and macOS must provide path - this will be checked before launch
                if (application.IsWindows) {
                    // Append actual file (based on architecture)
                    // NOTE: 32-bit only
                    this.FolderOrPath = path.join(this.FolderOrPath, application.OSPlatform, "x32", "A7800.exe");
                }
            }
            // Result
            return true;
        });
    }
    ExecuteEmulatorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:A7800Emulator.ExecuteEmulatorAsync');
            // Prepare
            application.CompilerOutputChannel.appendLine('');
            // Linux and MacOS must provide path (for now)
            if ((application.IsLinux || application.IsMacOS) && !this.CustomFolderOrPath) {
                application.Notify(`ERROR: You must provide a path to your ${this.Id} emulator before you can launch your game. Review your selection in Preference -> Extensions -> ${application.DisplayName}.`);
                return false;
            }
            // Compiler options
            let command = this.FolderOrPath;
            // Args
            let args = [
                "a7800",
                "-cart",
                this.Args,
                `"${this.FileName}"`
            ];
            // Process
            application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);
            // Launch
            let executeResult = yield execute.Spawn(command, args, null, path.dirname(this.FolderOrPath), (stdout) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
            // Result
            return executeResult;
        });
    }
}
exports.A7800Emulator = A7800Emulator;
//# sourceMappingURL=a7800Emulator.js.map
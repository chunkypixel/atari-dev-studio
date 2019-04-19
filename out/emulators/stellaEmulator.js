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
class StellaEmulator extends emulatorBase_1.EmulatorBase {
    constructor() {
        super("Stella", "Stella", path.join(application.Path, "out", "bin", "emulators", "stella"));
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:StellaEmulator.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result)
                return false;
            // Emulator
            // NOTE: macOS must provide path (for now) - this will be checked before launch
            if (!this.CustomFolderOrPath) {
                // Append actual file (based on architecture)
                if (application.IsWindows) {
                    this.FolderOrPath = path.join(this.FolderOrPath, application.OSPlatform, application.OSArch, "Stella.exe");
                }
                else if (application.IsLinux) {
                    this.FolderOrPath = path.join(this.FolderOrPath, application.OSPlatform, application.OSArch, "stella");
                }
            }
            // Result
            return true;
        });
    }
    ExecuteEmulatorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:StellaEmulator.ExecuteEmulatorAsync');
            // Prepare
            application.CompilerOutputChannel.appendLine('');
            // Validate inbuilt availability
            if ((application.IsMacOS) && !this.CustomFolderOrPath) {
                application.Notify(`WARNING: You must provide a path to your ${this.Id} emulator before you can launch your game. Review your selection in Preference -> Extensions -> ${application.DisplayName}.`);
                return false;
            }
            // Compiler options
            let command = this.FolderOrPath;
            // Args
            let args = [
                this.Args,
                `"${this.FileName}"`
            ];
            // Process
            application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);
            // Launch
            let executeResult = yield execute.Spawn(command, args, null, path.dirname(this.FileName), (stdout) => {
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
exports.StellaEmulator = StellaEmulator;
//# sourceMappingURL=stellaEmulator.js.map
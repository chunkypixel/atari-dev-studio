"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeventyEightHundredGDSerial = void 0;
const path = require("path");
const application = require("../application");
const execute = require("../execute");
const serialBase_1 = require("./serialBase");
class SeventyEightHundredGDSerial extends serialBase_1.SerialBase {
    constructor() {
        super("7800GD", "7800GD", path.join(application.Path, "out", "bin", "serial", "7800gd", "7800cmd.exe"));
    }
    ExecuteSerialAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredGDSerial.ExecuteSerialAsync');
            // Load
            var configuration = application.GetConfiguration();
            var comPort = configuration.get(`launch.emulatorOrCartComPort`, "Emulator").toLowerCase();
            // Prepare
            application.CompilerOutputChannel.appendLine('');
            // Command
            let command = `"${this.FolderOrPath}"`;
            // Args
            let args = [
                `-com ${comPort}`,
                `-run "${this.FileName}"`
            ];
            // Process
            application.CompilerOutputChannel.appendLine(`Launching ${this.Name} serial process...`);
            // Launch
            let executeResult = yield execute.Spawn(command, args, null, path.dirname(this.FolderOrPath), (stdout) => {
                // Prepare
                let result = true;
                // Sanitize output
                // need to remove +\b from mesages (looks a bit nicer)
                var pattern = /[+][\b]+/gi;
                stdout = stdout.replace(pattern, "");
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
exports.SeventyEightHundredGDSerial = SeventyEightHundredGDSerial;
//# sourceMappingURL=SeventyEightHundredGDSerial.js.map
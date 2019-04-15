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
const filesystem = require("../filesystem");
const compilerBase_1 = require("./compilerBase");
class BatariBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("batari Basic", [".bas", ".bb"], path.join(application.Path, "out", "bin", "bb"));
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Result
            return true;
        });
    }
    LoadConfiguration() {
        console.log('debugger:BatariBasicCompiler.LoadConfiguration');
        // Base
        if (!super.LoadConfiguration())
            return false;
        // Compiler
        let userCompilerFolder = this.configuration.get("batariBasic.compilerFolder");
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                let message = `ERROR: Cannot locate your chosen batari Basic compiler folder '${userCompilerFolder}'`;
                this.outputChannel.appendLine(message);
                console.log(`debugger:${message}`);
                return false;
            }
            // Set
            this.CompilerFolder = userCompilerFolder;
            this.CustomCompilerFolder = true;
        }
        let userCompilerArgs = this.configuration.get("batariBasic.compilerArgs");
        if (userCompilerArgs)
            this.CompilerArgs = userCompilerArgs;
        // Result
        return true;
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomCompilerFolder || application.IsWindows)
                return true;
            // Prepare
            let architecture = "Linux";
            if (application.IsMacOS)
                architecture = "Darwin";
            // Process
            let result = yield filesystem.SetChMod(path.join(this.CompilerFolder, '2600basic.sh'));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `2600basic.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `dasm.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `bbfilter.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `optimize.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `postprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `preprocess.${architecture}.x86`));
            return result;
        });
    }
}
exports.BatariBasicCompiler = BatariBasicCompiler;
//# sourceMappingURL=batariBasicCompiler.js.map
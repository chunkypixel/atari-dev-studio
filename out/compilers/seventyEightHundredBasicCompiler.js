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
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("7800basic", [".bas", ".78b"], path.join(application.Path, "out", "bin", "7800basic"));
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Result
            return true;
        });
    }
    LoadConfiguration() {
        console.log('debugger:SeventyEightHundredBasicCompiler.LoadConfiguration');
        // Base
        if (!super.LoadConfiguration())
            return false;
        // Compiler
        let userCompilerFolder = this.configuration.get("7800basic.compilerFolder");
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                let message = `ERROR: Cannot locate your chosen 7800basic compiler folder '${userCompilerFolder}'`;
                this.outputChannel.appendLine(message);
                console.log(`debugger:${message}`);
                return false;
            }
            // Set
            this.CompilerFolder = userCompilerFolder;
            this.CustomCompilerFolder = true;
        }
        let userCompilerArgs = this.configuration.get("7800basic.compilerArgs");
        if (userCompilerArgs)
            this.CompilerArgs = userCompilerArgs;
        // Result
        return true;
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomCompilerFolder || application.IsWindows)
                return true;
            // Prepare
            let architecture = "Linux";
            if (application.IsMacOS)
                architecture = "Darwin";
            // Process
            let result = yield filesystem.SetChMod(path.join(this.CompilerFolder, '7800basic.sh'));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `7800basic.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `7800filter.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `7800header.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `7800optimize.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `7800postprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `7800preprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `dasm.${architecture}.x86`));
            if (result)
                result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `distella.${architecture}.x86`));
            return result;
        });
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map
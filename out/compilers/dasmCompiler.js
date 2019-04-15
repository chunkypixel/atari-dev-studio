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
class DasmCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("dasm", [".dasm", ".asm", ".a", ".h"], path.join(application.Path, "out", "bin", "dasm"));
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Result
            return true;
        });
    }
    LoadConfiguration() {
        console.log('debugger:DasmCompiler.LoadConfiguration');
        // Base
        if (!super.LoadConfiguration())
            return false;
        // Compiler
        let userCompilerFolder = this.configuration.get("dasm.compilerFolder");
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                let message = `ERROR: Cannot locate your chosen dasm compiler folder '${userCompilerFolder}'`;
                this.outputChannel.appendLine(message);
                console.log(`debugger:${message}`);
                return false;
            }
            // Set
            this.CompilerFolder = userCompilerFolder;
            this.CustomCompilerFolder = true;
        }
        let userCompilerArgs = this.configuration.get("dasm.compilerArgs");
        if (userCompilerArgs)
            this.CompilerArgs = userCompilerArgs;
        let userCompilerFormat = this.configuration.get("dasm.compilerFormat");
        if (userCompilerFormat)
            this.CompilerFormat = userCompilerFormat;
        let userCompilerVerboseness = this.configuration.get("dasm.compilerVerboseness");
        if (userCompilerVerboseness)
            this.CompilerVerboseness = userCompilerVerboseness;
        // Result
        return true;
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomCompilerFolder || application.IsWindows)
                return true;
            // Prepare
            let architecture = "Linux";
            if (application.IsMacOS)
                architecture = "Darwin";
            // Process
            let result = yield filesystem.SetChMod(path.join(this.CompilerFolder, `dasm.${architecture}.x86`));
            return result;
        });
    }
}
exports.DasmCompiler = DasmCompiler;
//# sourceMappingURL=dasmCompiler.js.map
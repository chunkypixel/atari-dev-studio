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
        super("dasm", "dasm", [".dasm", ".asm", ".a", ".h"], path.join(application.Path, "out", "bin", "dasm"));
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let command = this.FolderOrPath;
            let args = [
                this.FileName,
                `-o${this.CompiledFileName}`
            ];
            // Format
            args.push(`${"-f"}${this.Format}`);
            // Verboseness
            args.push(`${"-v"}${this.Verboseness}`);
            // Debugger
            if (this.GenerateDebuggerFiles) {
                // Process
                this.DebuggerExtensions.forEach((extension, arg) => {
                    args.push(`${arg}${this.FileName}${extension}`);
                });
            }
            // Optional
            if (this.Args) {
                args.push(`${this.Args}`);
            }
            // Process
            this.outputChannel.appendLine(`Building '${this.FileName}'...`);
            // TODO: Actual compile
            this.IsRunning = true;
            this.IsRunning = false;
            // Verify file size
            if (yield !this.VerifyCompiledFileSizeAsync())
                return false;
            // Move file(s) to Bin folder
            if (yield !this.MoveFilesToBinFolderAsync())
                return false;
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
        // We use a path instead of a folder for dasm for added flexibility
        this.CustomFolderOrPath = false;
        let userCompilerPath = this.configuration.get(`${application.Id}.${this.Id}.compilerPath`);
        if (userCompilerPath) {
            // Validate (user provided)
            if (!filesystem.FileExists(userCompilerPath)) {
                // Notify
                this.notify(`ERROR: Cannot locate your chosen ${this.Name} compiler path '${userCompilerPath}'`);
                return false;
            }
            // Set
            this.FolderOrPath = userCompilerPath;
            this.CustomFolderOrPath = true;
        }
        else {
            // dasm command (depends on OS)
            let dasmCommand = "dasm.exe";
            if (application.IsLinux) {
                // Linux
                dasmCommand = "dasm.Linux.x86";
            }
            else if (application.IsMacOS) {
                // MacOS
                dasmCommand = "dasm.Darwin.x86";
            }
            // Use the default
            this.FolderOrPath = path.join(this.DefaultFolderOrPath, dasmCommand);
        }
        // Result
        return true;
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows)
                return true;
            // Prepare
            let architecture = "Linux";
            if (application.IsMacOS)
                architecture = "Darwin";
            // Process
            let result = yield filesystem.SetChMod(path.join(this.FolderOrPath, `dasm.${architecture}.x86`));
            return result;
        });
    }
}
exports.DasmCompiler = DasmCompiler;
//# sourceMappingURL=dasmCompiler.js.map
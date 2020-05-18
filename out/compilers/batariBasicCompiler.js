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
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class BatariBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("batariBasic", "batari Basic", [".bas", ".bb"], [".bin"], path.join(application.Path, "out", "bin", "compilers", "bB"), "Stella");
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let commandName = "2600bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./2600basic.sh";
            }
            // Command
            let command = `"${path.join(this.FolderOrPath, commandName)}"`;
            // Args
            let args = [
                `"${this.FileName}"`,
                this.Args
            ];
            // Environment
            let env = {};
            env["PATH"] = this.FolderOrPath;
            if (application.IsLinux || application.IsMacOS) {
                // Additional for Linux or MacOS
                env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
            }
            env["bB"] = this.FolderOrPath;
            // Notify
            // Linux and macOS script has this message already
            if (application.IsWindows) {
                application.WriteToCompilerTerminal(`Starting build of ${this.FileName}...`, false);
            }
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Validate (batari Basic)
                if (stdout.includes("Compilation failed") || stdout.includes("error:")) {
                    // bB messages received (so far):
                    // Compilation failed
                    // error: Origin Reverse-indexed
                    // Fatal assembly error: Source is not resolvable.
                    // error: Unknown Mnemonic 'x'
                    // Unrecoverable error(s) in pass, aborting assembly!
                    // Failed
                    result = false;
                }
                // Result
                application.WriteToCompilerTerminal('' + stdout, false);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Validate
                if (stderr.includes("2600 Basic compilation complete.")) {
                    // Ok - bB throws out standard message here that it shouldn't so we need to verify everything arrr...
                }
                else if (stderr.includes("User-defined score_graphics.asm found in current directory")) {
                    // Ok - bB throws out standard message here that it shouldn't so we need to verify everything arrr...
                }
                else if (stderr.includes("Parse error") || stderr.includes("error:") || stderr.includes("Permission denied")) {
                    // bB messages received (so far):
                    // Parse error
                    // Error: 
                    // Permission denied
                    // Failed
                    result = false;
                }
                else if (stderr.includes("Cannot open includes.bB for reading")) {
                    // Special - seen this when the source is not processed correctly so we'll advise
                    // obviously doesn't get to the point of copying over this file
                    application.WriteToCompilerTerminal("WARNING: An unknown issue has occurred during compilation that may have affected your build....", false);
                    // Failed
                    result = false;
                }
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
            this.IsRunning = false;
            // Finalise
            if (executeResult) {
                executeResult = yield this.VerifyCompiledFileSizeAsync();
            }
            yield this.RemoveCompilationFilesAsync();
            if (executeResult) {
                executeResult = yield this.MoveFilesToBinFolderAsync();
            }
            // Result
            return executeResult;
        });
    }
    // protected LoadConfiguration(): boolean {
    //     console.log('debugger:BatariBasicCompiler.LoadConfiguration');  
    //     // Base
    //     if (!super.LoadConfiguration()) return false;
    //     // Result
    //     return true;
    // }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows) {
                return true;
            }
            // Prepare
            let platform = "Linux";
            if (application.IsMacOS) {
                platform = "Darwin";
            }
            // Process
            let result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, '2600basic.sh'));
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `2600basic.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `dasm.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `bbfilter.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `optimize.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `postprocess.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `preprocess.${platform}.${application.OSArch}`));
            }
            return result;
        });
    }
    RemoveCompilationFilesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.RemoveCompilationFilesAsync');
            // Language specific files
            if (this.CleanUpCompilationFiles) {
                // Notify
                application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);
                // Process
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `bB.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `includes.bB`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `2600basic_variable_redefs.h`));
            }
            // Debugger files (from workspace not bin)
            // Note: Remove if option is turned off as they are generated by bB (cannot change I believe)
            if (!this.GenerateDebuggerFiles) {
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            }
            // Result
            return true;
        });
    }
}
exports.BatariBasicCompiler = BatariBasicCompiler;
//# sourceMappingURL=batariBasicCompiler.js.map
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
exports.SeventyEightHundredBasicCompiler = void 0;
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("7800basic", "7800basic", [".bas", ".78b"], [".a78", ".bin", ".bin.CC2"], [".a78", ".bin"], path.join(application.Path, "out", "bin", "compilers", "7800basic"), "A7800");
        // Debugger extensions
        this.DebuggerExtensions = new Map([["-s", ".symbol.txt"], ["-l", ".list.txt"]]);
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');
            // Validate compiler files
            // Note: for anti-virus quarantining
            if (!(yield this.VerifyCompilerFilesExistsAsync())) {
                return false;
            }
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let commandName = "7800bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./7800basic.sh";
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
            env["bas7800dir"] = this.FolderOrPath;
            // Notify
            // Linux and macOS script has this message already
            if (application.IsWindows) {
                application.WriteToCompilerTerminal(`Starting build of ${this.FileName}...`);
            }
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Validate
                if (stdout.includes("Fatal assembly error") || stdout.includes("Compilation failed.") ||
                    stdout.includes("Unrecoverable error(s) in pass, aborting assembly!") ||
                    stdout.includes("error:") ||
                    stdout.includes("segment:")) {
                    // Potential messages received (so far):
                    // Fatal assembly error: Source is not resolvable.
                    // Compilation failed.
                    // Unrecoverable error(s) in pass, aborting assembly!
                    // error: Label mismatch
                    // segment: INITIAL CODE SEGMENT
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
                if (stderr.includes("Permission denied") ||
                    stderr.includes("*** WARNING: the file size of")) {
                    // Potential messages received (so far):
                    // Permission denied
                    // *** WARNING: The file size of <file> isn't correct.
                    // *** ERROR, incmapfile couldn't open map file 'maps\level1.tmx' for reading
                    // Failed
                    result = false;
                }
                // Result
                application.WriteToCompilerTerminal('' + stderr, false);
                return result;
            });
            this.IsRunning = false;
            // Cleanup (regardless of state if chosen)
            application.WriteToCompilerTerminal(``, false);
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
    RemoveCompilationFilesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');
            // Language specific files
            if (this.CleanUpCompilationFiles) {
                // Notify
                application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);
                // Process
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `includes.7800`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `a78info.cfg`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800basic_variable_redefs.h`));
                // DMAHole
                // Not sure how many here??
                for (let index = 0; index < 25; index++) {
                    yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800hole.${index}.asm`));
                }
            }
            // Debugger files (from workspace not bin)
            // Note: Remove if option is turned off as they are generated by 7800basic (cannot change I believe)
            if (!this.GenerateDebuggerFiles) {
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            }
            // Result
            return true;
        });
    }
    GetCompilerFileList() {
        // Prepare
        let command = (application.IsWindows ? "7800bas.bat" : "7800basic.sh");
        let platform = "";
        if (application.IsLinux) {
            platform = ".Linux";
        }
        if (application.IsMacOS) {
            platform = ".Darwin";
        }
        let extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);
        // Result
        return [command,
            `7800basic${platform}${extension}`,
            `7800filter${platform}${extension}`,
            `7800header${platform}${extension}`,
            `7800optimize${platform}${extension}`,
            `7800postprocess${platform}${extension}`,
            `7800preprocess${platform}${extension}`,
            `7800sign${platform}${extension}`,
            `7800makecc2${platform}${extension}`,
            `dasm${platform}${extension}`];
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map
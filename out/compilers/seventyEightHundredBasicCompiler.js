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
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("7800basic", "7800basic", [".bas", ".78b"], [".a78", ".bin"], path.join(application.Path, "out", "bin", "compilers", "7800basic"), "A7800");
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let commandName = "7800bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./7800basic.sh";
            }
            // Compiler options
            let command = path.join(this.FolderOrPath, commandName);
            let args = [
                `"${this.FileName}"`,
                this.Args
            ];
            // Compiler environment
            let env = {};
            env["PATH"] = this.FolderOrPath;
            if (application.IsLinux || application.IsMacOS) {
                // Additional for Linux or MacOS
                env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
            }
            env["bas7800dir"] = this.FolderOrPath;
            // Notify
            // Linux and macOS script has this message already
            if (application.IsWindows)
                application.CompilerOutputChannel.appendLine(`Starting build of ${this.FileName}...`);
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Validate
                if (stderr.includes("Permission denied")) {
                    // Potential messages received (so far):
                    // Permission denied
                    // Failed
                    result = false;
                }
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
            this.IsRunning = false;
            // Cleanup (regardless of state if chosen)
            application.CompilerOutputChannel.appendLine(``);
            // Finalise
            if (executeResult)
                executeResult = yield this.VerifyCompiledFileSizeAsync();
            yield this.RemoveCompilationFilesAsync(executeResult);
            if (executeResult)
                executeResult = yield this.MoveFilesToBinFolderAsync();
            // Result
            return executeResult;
        });
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result)
                return false;
            // System
            // Not available for 7800basic
            this.GenerateDebuggerFiles = false;
            // Result
            return true;
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows)
                return true;
            // Prepare
            let architecture = "Linux";
            if (application.IsMacOS)
                architecture = "Darwin";
            // Process
            let result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, '7800basic.sh'));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800basic.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800filter.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800header.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800optimize.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800postprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800preprocess.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800sign.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `dasm.${architecture}.x86`));
            if (result)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `distella.${architecture}.x86`));
            // Result
            return result;
        });
    }
    RemoveCompilationFilesAsync(result) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');
            // Language specific files
            if (this.CleanUpCompilationFiles || !result) {
                // Notify
                application.Notify(`Cleaning up files generated during compilation...`);
                // Process
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `includes.7800`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `a78info.cfg`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800basic_variable_redefs.h`));
            }
            // Debugger files (from workspace not bin)
            // Note: Remove if option is turned off as they are generated by 7800basic (cannot change I believe)
            if (!this.GenerateDebuggerFiles || !result) {
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            }
            // Result
            return true;
        });
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map
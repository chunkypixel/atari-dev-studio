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
exports.DasmCompiler = void 0;
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class DasmCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("dasm", "dasm", [".dasm", ".asm", ".a", ".h"], [".bin"], [".bin"], path.join(application.Path, "out", "bin", "compilers", "dasm"), "Stella");
        // Features
        this.Format = "";
        this.Verboseness = "";
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log('debugger:DasmCompiler.ExecuteCompilerAsync');
            // Make compile?
            if (this.UsingMakeFileCompiler) {
                // Launch and exit
                (_a = application.AdsTerminal) === null || _a === void 0 ? void 0 : _a.sendText(`make`);
                return true;
            }
            // Bat or Shell compiler?
            if (this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
                // Launch and exit
                (_b = application.AdsTerminal) === null || _b === void 0 ? void 0 : _b.sendText(`${this.FileName}`);
                return true;
            }
            // Standard compile
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Command
            let command = `"${this.FolderOrPath}"`;
            // Args
            let args = [
                `"${this.FileName}"`,
                `-o"${this.FileName}${this.CompiledExtensions[0]}"`
            ];
            if (this.Format) {
                args.push(`${"-f"}${this.Format}`);
            }
            if (this.Verboseness) {
                args.push(`${"-v"}${this.Verboseness}`);
            }
            if (this.GenerateDebuggerFiles) {
                this.DebuggerExtensions.forEach((extension, arg) => {
                    args.push(`${arg}"${this.FileName}${extension}"`);
                });
            }
            if (this.Args) {
                args.push(`${this.Args}`);
            }
            // Environment
            let env = {};
            // Notify
            application.CompilerOutputChannel.appendLine(`Starting build of ${this.FileName}...`);
            // Process
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Validate
                if (stdout.includes("Parse error:") || stdout.includes("error:")) {
                    // Potential messages received (so far):
                    // Parse error
                    // Error: 
                    // Failed
                    result = false;
                }
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
            // Finalise
            if (executeResult) {
                executeResult = yield this.VerifyCompiledFileSizeAsync();
            }
            yield this.RemoveCompilationFilesAsync(executeResult);
            if (executeResult) {
                executeResult = yield this.MoveFilesToBinFolderAsync();
            }
            // Result
            return executeResult;
        });
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result) {
                return false;
            }
            // Using a make process? if so we can skip some of the configuration
            if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
                return true;
            }
            // Default compiler
            if (!this.CustomFolderOrPath) {
                // dasm name (depends on OS)
                let dasmName = "dasm.exe";
                if (application.IsLinux) {
                    // Linux
                    dasmName = "dasm";
                }
                else if (application.IsMacOS) {
                    // MacOS
                    dasmName = "dasm";
                }
                // Append path (based on architecture and emulator name)
                this.FolderOrPath = path.join(this.DefaultFolderOrPath, application.OSPlatform, application.OSArch, dasmName);
            }
            // Compiler (other)
            this.Format = this.Configuration.get(`compiler.${this.Id}.format`, "3");
            this.Verboseness = this.Configuration.get(`compiler.${this.Id}.verboseness`, "0");
            // Emulator
            // User can select required emulator from settings
            let userDefaultEmulator = this.Configuration.get(`compiler.${this.Id}.defaultEmulator`);
            if (userDefaultEmulator) {
                this.Emulator = userDefaultEmulator;
            }
            // Result
            return true;
        });
    }
    ValidateCustomCompilerLocationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.ValidateCustomCompilerLocationAsync');
            // Validate for a folder
            let customCompilerPath = this.Configuration.get(`compiler.${this.Id}.path`);
            if (!customCompilerPath) {
                // No custom compiler provided, revert
                let message = `WARNING: You have chosen to use a custom ${this.Name} compiler but have not provided the location.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                application.ShowWarningPopup(message);
            }
            else {
                // Validate custom compiler path exists
                let result = yield filesystem.FileExistsAsync(customCompilerPath);
                if (!result) {
                    // Failed, revert
                    let message = `WARNING: Your custom ${this.Name} compiler location '${customCompilerPath}' cannot be found.\nReverting to the default compiler...`;
                    application.WriteToCompilerTerminal(message);
                    application.ShowWarningPopup(message);
                }
                else {
                    // Ok
                    application.WriteToCompilerTerminal(`Building using your custom ${this.Name} compiler.`);
                    application.WriteToCompilerTerminal(`Location: ${customCompilerPath}`);
                    // Set
                    this.FolderOrPath = customCompilerPath;
                    this.CustomFolderOrPath = true;
                }
            }
            // Finalise
            application.WriteToCompilerTerminal("");
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows) {
                return true;
            }
            // Github: https://github.com/chunkypixel/atari-dev-studio/issues/1
            //         Duplication of filename
            // Process
            let result = yield filesystem.ChModAsync(this.FolderOrPath);
            return result;
        });
    }
    RemoveCompilationFilesAsync(result) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:DasmCompiler.RemoveCompilationFiles');
            // Language specific files
            if (!result) {
                // Process
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.bin`));
            }
            // Don't think we need this as user chooses to generate and as they are
            // not compilation files we don't need to remove them
            /* // Debugger files (from workspace not bin)
              if (!this.GenerateDebuggerFiles || this.CleanUpCompilationFiles) {
                await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            } */
            // Result
            return true;
        });
    }
}
exports.DasmCompiler = DasmCompiler;
//# sourceMappingURL=dasmCompiler.js.map
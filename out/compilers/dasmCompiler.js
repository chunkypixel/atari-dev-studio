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
class DasmCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("dasm", "dasm", [".dasm", ".asm", ".a", ".h"], [".bin"], path.join(application.Path, "out", "bin", "compilers", "dasm"), "Stella");
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
                `-o${this.FileName}${this.CompiledExtensions[0]}`
            ];
            // Format
            if (this.Format)
                args.push(`${"-f"}${this.Format}`);
            // Verboseness
            if (this.Verboseness)
                args.push(`${"-v"}${this.Verboseness}`);
            // Args
            if (this.GenerateDebuggerFiles) {
                // Process
                this.DebuggerExtensions.forEach((extension, arg) => {
                    args.push(`${arg}${this.FileName}${extension}`);
                });
            }
            if (this.Args) {
                args.push(`${this.Args}`);
            }
            // Env
            let env = {};
            // Notify
            application.CompilerOutputChannel.appendLine(`Starting build of ${this.FileName}...`);
            // Compile
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
            // Validate
            if (!executeResult)
                return false;
            // Finalise
            let result = yield this.VerifyCompiledFileSizeAsync();
            if (result)
                result = yield this.MoveFilesToBinFolderAsync();
            // Result
            return result;
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
            if (!result)
                return false;
            // Compiler
            // We use a path instead of a folder for dasm for added flexibility
            this.CustomFolderOrPath = false;
            let userCompilerPath = this.Configuration.get(`compiler.${this.Id}.path`);
            if (userCompilerPath) {
                // Validate (user provided)
                let result = yield filesystem.FileExistsAsync(userCompilerPath);
                if (!result) {
                    // Notify
                    application.Notify(`ERROR: Cannot locate your chosen ${this.Name} compiler path '${userCompilerPath}'`);
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
            let result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `dasm.${architecture}.x86`));
            return result;
        });
    }
}
exports.DasmCompiler = DasmCompiler;
//# sourceMappingURL=dasmCompiler.js.map
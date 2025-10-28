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
exports.BatariBasicCompiler = void 0;
const vscode = require("vscode");
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class BatariBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        // NOTE: '.ace' CompiledExtension requires all existing extensions to be stripped (-)
        super(application.BatariBasicLanguageId, "batari Basic", [".bas", ".bb"], [".bin", "-.ace"], [".bin"], path.join(application.Path, "out", "bin", "compilers", "bB"), "Stella");
    }
    GetCompilerVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // Prepare
            const filePath = vscode.Uri.file(path.join(this.FolderOrPath, 'release.dat'));
            this.CompilerVersion = application.BATARIBASIC_WASMTIME_RELEASE;
            // Read contents of release.dat file
            if (yield (filesystem.FileExistsAsync(filePath.fsPath))) {
                const fileContent = (yield filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/);
                if (fileContent.length > 0 && application.IsNumber(fileContent[0])) {
                    this.CompilerVersion = parseFloat(fileContent[0]);
                }
            }
        });
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.ExecuteCompilerAsync');
            // Validate compiler files
            if (!(yield this.VerifyCompilerFilesExistsAsync()))
                return false;
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let commandName = "2600bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./2600basic.sh";
            }
            // Command
            const command = `"${path.join(this.FolderOrPath, commandName)}"`;
            // Args
            const args = [
                `"${this.FileName}"`
            ];
            if (this.Args)
                args.push(this.Args);
            // Environment
            const env = {
                PATH: (process.env.PATH + ";" || '') + this.FolderOrPath,
                bB: this.FolderOrPath
            };
            // Additional for Linux or MacOS?
            if (application.IsLinux || application.IsMacOS)
                env["PATH"] += `${path.delimiter}/bin${path.delimiter}/usr/bin`;
            // Check for spaces in folder and file name
            this.ValidateIfProjectFolderAndFileContainsSpaces();
            // Spacer
            application.WriteToCompilerTerminal();
            // TODO: These might need checking for the new WASMTIME build??
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                const outMessage = stdout.toLowerCase();
                // Validate (batari Basic)
                if (outMessage.includes("compilation failed") ||
                    outMessage.includes("error:")) {
                    // Messages received (so far):
                    // Compilation failed
                    // error: Origin Reverse-indexed
                    // Fatal assembly error: Source is not resolvable.
                    // error: Unknown Mnemonic 'x'
                    // Unrecoverable error(s) in pass, aborting assembly!
                    // Failed
                    result = false;
                }
                // Result
                application.WriteToCompilerTerminal(stdout, false, false);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                const errMessage = stderr.toLowerCase();
                // Validate
                if (errMessage.includes("parse error") ||
                    errMessage.includes("error:") ||
                    errMessage.includes("permission denied")) {
                    // Messages received (so far):
                    // Parse error
                    // Error: 
                    // Permission denied
                    // Failed
                    result = false;
                }
                else if (errMessage.includes("cannot open includes.bb for reading")) {
                    // Special - seen this when the source is not processed correctly so we'll advise
                    // obviously doesn't get to the point of copying over this file
                    application.WriteToCompilerTerminal();
                    application.WriteToCompilerTerminal("WARNING: An unknown issue has occurred during compilation that may have affected your build....");
                    // Failed
                    result = false;
                }
                // Result                
                application.WriteToCompilerTerminal(stderr, false);
                return result;
            });
            this.IsRunning = false;
            // Spacer
            application.WriteToCompilerTerminal();
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
    RemoveCompilationFilesAsync(executeResult) {
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
                // Binary?
                if (!executeResult)
                    yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.bin`));
            }
            // Debugger files (from workspace not bin)
            // Note: Remove if option is turned off as they are generated by bB (cannot change I believe)
            if (!this.GenerateDebuggerFiles || !executeResult)
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            // Result
            return true;
        });
    }
    GetCompilerFileList() {
        console.log('debugger:BatariBasicCompiler.GetCompilerFileList');
        // Prepare
        const command = (application.IsWindows ? "2600bas.bat" : "2600basic.sh");
        // for Wasmtime we only need to validate the script file by the looks from my testing...
        let compilerFileList = [command];
        // Validate if we are using an older version of bB
        // support 1.2-1.8
        if (this.CompilerVersion < application.BATARIBASIC_WASMTIME_RELEASE) {
            // Prepare
            let platform = "";
            if (application.IsLinux)
                platform = ".Linux";
            if (application.IsMacOS)
                platform = ".Darwin";
            const extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);
            // Default items
            compilerFileList.push(`2600basic${platform}${extension}`, `bbfilter${platform}${extension}`, `optimize${platform}${extension}`, `postprocess${platform}${extension}`, `preprocess${platform}${extension}`, `dasm${platform}${extension}`);
            // As of 15/06/25 (v1.8) the existing ARM version does not cater for this file
            if (this.CompilerVersion == 1.8 && !application.IsMacOSArm) {
                compilerFileList.push(`relocateBB${platform}${extension}`);
            }
        }
        // Return
        return compilerFileList;
    }
    GetDebuggerFileList() {
        console.log('debugger:BatariBasicCompiler.GetDebuggerFileList');
        // Validate
        if (this.CompilerVersion < application.BATARIBASIC_WASMTIME_RELEASE)
            return new Map([["-s", ".sym"], ["-l", ".lst"]]);
        return new Map([["-s", ".symbol.txt"], ["-l", ".list.txt"]]);
        ;
    }
    VerifyCompilerFilesExistsAsync() {
        const _super = Object.create(null, {
            VerifyCompilerFilesExistsAsync: { get: () => super.VerifyCompilerFilesExistsAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatariBasicCompiler.VerifyCompilerFilesExistsAsync');
            // Verfiy
            let result = _super.VerifyCompilerFilesExistsAsync.call(this);
            if (!result && this.CompilerVersion < application.BATARIBASIC_WASMTIME_RELEASE) {
                const message = "NOTE: your anti-virus software may have quarantined one or more files related to the compiler due to a false/positive test and where this is the case please ensure you whitelist to allow these files to used.  Alternatively try re-installing the extension.";
                application.WriteToCompilerTerminal(message);
            }
            // Result
            return result;
        });
    }
}
exports.BatariBasicCompiler = BatariBasicCompiler;
//# sourceMappingURL=batariBasicCompiler.js.map
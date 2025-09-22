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
const vscode = require("vscode");
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("7800basic", "7800basic", [".bas", ".78b"], [".a78", ".bin", ".bin.CC2", ".bin.versa"], [".a78", ".bin"], path.join(application.Path, "out", "bin", "compilers", "7800basicwasm"), "A7800");
        // Debugger extensions
        this.DebuggerExtensions = new Map([["-s", ".symbol.txt"], ["-l", ".list.txt"]]);
        // Launch options
        this.LaunchEmulatorOrCartOptionAvailable = true;
    }
    GetCompilerVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // Prepare
            const filePath = vscode.Uri.file(path.join(this.FolderOrPath, 'release.dat'));
            // min version of wasmtime releases of 7800basic/batariBasic
            this.CompilerVersion = application.WASMTIME_RELEASE;
            // attempt to read contents
            if (yield (filesystem.FileExistsAsync(filePath.fsPath))) {
                let fileContent = (yield filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).toString().split(/\r?\n/);
                if (!fileContent.any && application.IsNumber(fileContent[0])) {
                    this.CompilerVersion = parseFloat(fileContent[0]);
                }
            }
        });
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
            let env = {
                PATH: (process.env.PATH + ";" || '') + this.FolderOrPath,
                bas7800dir: this.FolderOrPath
            };
            // Additional for Linux or MacOS?
            if (application.IsLinux || application.IsMacOS)
                env["PATH"] += `${path.delimiter}/bin${path.delimiter}/usr/bin`;
            // Spacer
            application.WriteToCompilerTerminal();
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
                application.WriteToCompilerTerminal(stdout, false);
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
                application.WriteToCompilerTerminal(stderr, false);
                return result;
            });
            this.IsRunning = false;
            // Spacer
            application.WriteToCompilerTerminal();
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
                for (let index = 0; index < 3; index++) {
                    yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800hole.${index}.asm`));
                }
                // Banksets
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `banksetrom.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `banksetrom.bin`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `banksetrom.list.txt`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `banksetrom.symbol.txt`));
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
        // for Wasmtime we only need to validate the script file by the looks from my testing...
        let compilerFileList = [command];
        // Validate if we are using an older version of 7800basic
        if (this.CompilerVersion < application.WASMTIME_RELEASE) {
            let platform = "";
            if (application.IsLinux) {
                platform = ".Linux";
            }
            if (application.IsMacOS) {
                platform = ".Darwin";
            }
            let extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);
            // Yes! can only be version 0.22-0.36 as versions before will NOT include the release.dat file
            // Default items
            compilerFileList.push(`7800basic${platform}${extension}`, `7800filter${platform}${extension}`, `7800header${platform}${extension}`, `7800optimize${platform}${extension}`, `7800postprocess${platform}${extension}`, `7800preprocess${platform}${extension}`, `7800sign${platform}${extension}`, `7800makecc2${platform}${extension}`, `snip${platform}${extension}`);
            // As of 1/11/23 the existing ARM version does not cater for this file
            if (!application.IsMacOSArm) {
                compilerFileList.push(`dasm${platform}${extension}`);
            }
            // Append additional items (based on the version)
            if (this.CompilerVersion >= 0.22) {
                compilerFileList.push(`7800rmtfix${platform}${extension}`, `banksetsymbols${platform}${extension}`);
            }
            if (this.CompilerVersion >= 0.27) {
                compilerFileList.push(`7800rmt2asm${platform}${extension}`);
            }
            // As of 8/06/25 (v0.34) the LZSA file is no longer used
            // As of 1/11/23 (v0.31) the existing ARM version does not cater for this file
            if (this.CompilerVersion >= 0.31 && this.CompilerVersion <= 0.33 &&
                !application.IsMacOSArm) {
                compilerFileList.push(`lzsa${platform}${extension}`);
            }
        }
        // Return
        return compilerFileList;
    }
    ShowAnyCompilerWarnings() {
        console.log('debugger:SeventyEightHundredBasicCompiler.ShowAnyCompilerWarnings');
        if (application.IsMacOSArm && this.CompilerVersion < application.WASMTIME_RELEASE) {
            let message = `WARNING: The included MacOS ARM version of 7800basic is a number of versions behind the official build (currently v${this.CompilerVersion}) and may not compile correctly due to missing features and functionality.`;
            application.WriteToCompilerTerminal(message);
            application.WriteToCompilerTerminal(``);
        }
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeventyEightHundredBasicCompiler = void 0;
const vscode = require("vscode");
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const stopwatch_1 = require("../stopwatch");
const compilerBase_1 = require("./compilerBase");
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId, "7800basic", [".bas", ".78b"], [".a78", ".bin", ".bin.CC2", ".bin.versa"], [".a78", ".bin"], path.join(application.Path, "out", "bin", "compilers", "7800basic"), "A7800");
        // Launch options
        this.LaunchEmulatorOrCartOptionAvailable = true;
    }
    BuildGameAndRunAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            console.log('debugger:SeventyEightHundredBasicCompiler.BuildGameAndRunAsync');
            // Process
            const result = yield this.BuildGameAsync(document);
            if (!result)
                return false;
            // Does compiler have/use an emulator?
            // Make doesn't use an emulator - user must provide their own
            if (this.Emulator === '' || (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler))
                return true;
            // Use/Try serial?
            if (this.LaunchEmulatorOrCartOption == "7800GD") {
                // Validate
                if (!application.IsWindows) {
                    // WINDOWS ONLY - Advise
                    application.WriteToCompilerTerminal('Warning: Sending to 7800GD cart is currently only available for Windows - reverting to emulator...');
                }
                else {
                    // Find
                    var serial = application.Serials.find(s => s.Id === this.LaunchEmulatorOrCartOption);
                    if (serial) {
                        // Match
                        const compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                        return yield serial.SendGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
                    }
                }
            }
            try {
                // Try emulator
                for (var _d = true, _e = __asyncValues(application.Emulators), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const emulator = _c;
                    if (emulator.Id === this.Emulator) {
                        // Note: first extension should be the one which is to be launched
                        const compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                        return yield emulator.RunGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Not found
            application.WriteToCompilerTerminal(`Unable to find emulator '${this.Emulator}' to launch game.`);
            return false;
        });
    }
    GetCompilerVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.GetCompilerVersionAsync');
            // Prepare
            const filePath = vscode.Uri.file(path.join(this.FolderOrPath, 'release.dat'));
            // Note: v0.21 and earlier didn't include the 'release.dat' file so we cannot support them properly unless file is manually added
            this.CompilerVersion = application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE;
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
            console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');
            // Validate compiler files and permissions
            if (!(yield this.VerifyCompilerFilesAndPermissionsExistsAsync()))
                return false;
            // Compiler options
            let commandName = "7800bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./7800basic.sh";
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
                bas7800dir: this.FolderOrPath
            };
            // Additional for Linux or MacOS?
            if (application.IsLinux || application.IsMacOS)
                env["PATH"] += `${path.delimiter}/bin${path.delimiter}/usr/bin`;
            // Check for spaces in folder and file name
            this.ValidateIfProjectFolderAndFileContainsSpaces();
            // Spacer
            application.WriteToCompilerTerminal();
            // Start stopwatch
            const sw = new stopwatch_1.StopWatch();
            sw.Start();
            // TODO: These might need checking for the new WASMTIME build??
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                const outMessage = stdout.toLowerCase();
                // Validate
                if (outMessage.includes("compilation failed") ||
                    outMessage.includes("error:") ||
                    outMessage.includes("fatal assembly error") ||
                    outMessage.includes("unrecoverable error(s) in pass, aborting assembly!") ||
                    outMessage.includes("segment:")) {
                    // Messages received (so far):
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
                const errMessage = stderr.toLowerCase();
                // Validate
                if (errMessage.includes("permission denied") ||
                    errMessage.includes("*** warning: the file size of")) {
                    // Messages received (so far):
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
            // Finalise and output result
            sw.Stop();
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
            console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');
            // Language specific files
            if (this.CleanUpCompilationFiles) {
                // Notify
                application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);
                // Process
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.pre`));
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
                // Binary?
                if (!executeResult)
                    yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.bin`));
            }
            // Debugger files (from workspace exludes bin - above)
            if (!this.GenerateDebuggerFiles || !executeResult)
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            // Result
            return true;
        });
    }
    GetCompilerFileList() {
        console.log('debugger:SeventyEightHundredBasicCompiler.GetCompilerFileList');
        // Prepare
        const command = (application.IsWindows ? "7800bas.bat" : "7800basic.sh");
        // for Wasmtime we only need to validate the script file by the looks from my testing...
        const compilerFileList = [command];
        // Validate if we are using an older version of 7800basic
        // support 0.22-0.36 
        // Note: v0.21 and earlier didn't include the 'release.dat' file so we cannot support them properly unless file is manually added
        if (this.CompilerVersion < application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE) {
            // Prepare
            let platform = "";
            if (application.IsLinux)
                platform = ".Linux";
            if (application.IsMacOS)
                platform = ".Darwin";
            const extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);
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
            if (this.CompilerVersion >= 0.31 && this.CompilerVersion <= 0.33 && !application.IsMacOSArm) {
                compilerFileList.push(`lzsa${platform}${extension}`);
            }
        }
        // Return
        return compilerFileList;
    }
    GetDebuggerFileList() {
        console.log('debugger:SeventyEightHundredBasicCompiler.GetDebuggerFileList');
        // Return
        return new Map([["-s", ".symbol.txt"], ["-l", ".list.txt"]]);
        ;
    }
    VerifyCompilerFilesAndPermissionsExistsAsync() {
        const _super = Object.create(null, {
            VerifyCompilerFilesAndPermissionsExistsAsync: { get: () => super.VerifyCompilerFilesAndPermissionsExistsAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.VerifyCompilerFilesAndPermissionsExistsAsync');
            // Verify
            const result = _super.VerifyCompilerFilesAndPermissionsExistsAsync.call(this);
            // Is windows and older version?
            if (!result && application.IsWindows && this.CompilerVersion < application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE) {
                const message = "NOTE: your anti-virus software may have quarantined one or more files related to the compiler due to a false/positive test and where this is the case please ensure you whitelist to allow these files to used.  Alternatively try re-installing the extension.";
                application.WriteToCompilerTerminal(message);
            }
            // Result
            return result;
        });
    }
    ShowAnyCompilerWarnings() {
        console.log('debugger:SeventyEightHundredBasicCompiler.ShowAnyCompilerWarnings');
        // Validate
        if (application.IsMacOSArm && this.CompilerVersion < application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE) {
            const message = `WARNING: The latest working MacOS ARM version of 7800basic is a number of versions behind the official build (currently v${this.CompilerVersion}) and may not compile correctly due to missing features and functionality. Note: The officially included version built using WASM should support all Apple silicon where the wasmtime runtime is available.`;
            application.WriteToCompilerTerminal(message);
            application.WriteToCompilerTerminal(``);
        }
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map
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
exports.CompilerBase = void 0;
const vscode = require("vscode");
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
class CompilerBase {
    constructor(id, name, extensions, compiledExtensions, verifyCompiledExtensions, folderOrPath, emulator) {
        // Features
        this.IsRunning = false;
        // Note: these need to be in reverse order compared to how they are read
        this.DebuggerExtensions = new Map([["-s", ".sym"], ["-l", ".lst"]]);
        this.CustomFolderOrPath = false;
        this.FolderOrPath = "";
        this.Args = "";
        this.Emulator = "";
        this.CompilerVersion = 0.0;
        this.FileName = "";
        this.CompiledSubFolder = "";
        this.CompiledSubFolderName = "bin";
        this.GenerateDebuggerFiles = false;
        this.CleanUpCompilationFiles = false;
        this.WorkspaceFolder = "";
        this.UsingMakeFileCompiler = false;
        this.UsingBatchCompiler = false;
        this.UsingShellScriptCompiler = false;
        this.LaunchEmulatorOrCartOption = "";
        this.LaunchEmulatorOrCartOptionAvailable = false;
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
        this.CompiledExtensions = compiledExtensions;
        // if no verified compiled extensions then use default
        this.VerifyCompiledExtensions = verifyCompiledExtensions;
        if (!verifyCompiledExtensions)
            this.VerifyCompiledExtensions = compiledExtensions;
        this.DefaultFolderOrPath = folderOrPath;
        this.DefaultEmulator = emulator;
    }
    dispose() {
        console.log('debugger:CompilerBase.dispose');
    }
    BuildGameAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set
            this.Document = document;
            // Initialise
            let result = yield this.InitialiseAsync();
            if (!result) {
                return false;
            }
            // Execute
            return yield this.ExecuteCompilerAsync();
        });
    }
    BuildGameAndRunAsync(document) {
        var _a, e_1, _b, _c, _d, e_2, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            let result = yield this.BuildGameAsync(document);
            if (!result) {
                return false;
            }
            // Does compiler have/use an emulator?
            // Make doesn't use an emulator - user must provide their own
            if (this.Emulator === '' || (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler)) {
                return true;
            }
            // Use/Try serial (windows only)
            if (this.LaunchEmulatorOrCartOption != "Emulator") {
                // Validate
                if (!this.LaunchEmulatorOrCartOptionAvailable) {
                    // NOT AVAILABLE FOR LANGUAGE - Advise
                    application.WriteToCompilerTerminal(`Warning: Launching to 7800GD cart is not available for the ${this.Name} language - reverting to emulator...`);
                }
                else if (!application.IsWindows) {
                    // WINDOWS ONLY - Advise
                    application.WriteToCompilerTerminal(`Warning: Launching to 7800GD cart is currently only available for Windows - reverting to emulator...`);
                }
                else {
                    try {
                        // Find
                        for (var _g = true, _h = __asyncValues(application.Serials), _j; _j = yield _h.next(), _a = _j.done, !_a;) {
                            _c = _j.value;
                            _g = false;
                            try {
                                let serial = _c;
                                if (serial.Id === this.LaunchEmulatorOrCartOption) {
                                    // Match
                                    let compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                                    return yield serial.SendGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
                                }
                            }
                            finally {
                                _g = true;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_g && !_a && (_b = _h.return)) yield _b.call(_h);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
            try {
                // Try emulator
                for (var _k = true, _l = __asyncValues(application.Emulators), _m; _m = yield _l.next(), _d = _m.done, !_d;) {
                    _f = _m.value;
                    _k = false;
                    try {
                        let emulator = _f;
                        if (emulator.Id === this.Emulator) {
                            // Note: first extension should be the one which is to be launched
                            let compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                            return yield emulator.RunGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
                        }
                    }
                    finally {
                        _k = true;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_k && !_d && (_e = _l.return)) yield _e.call(_l);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // Not found
            application.WriteToCompilerTerminal(`Unable to find emulator '${this.Emulator}' to launch game.`);
            return false;
        });
    }
    InitialiseAsync() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.InitialiseAsync');
            // Prepare
            let result = true;
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = application.GetConfiguration();
            // Clear output content?
            // Note: need to do this here otherwise output from configuration is lost
            if (this.Configuration.get(`editor.clearPreviousOutput`)) {
                application.CompilerOutputChannel.clear();
            }
            // Already running?
            if (this.IsRunning) {
                // Notify
                application.WriteToCompilerTerminal(`The ${this.Name} compiler is already running! If you need to cancel the compilation process use the 'ads: Kill build process' option from the Command Palette.`);
                return false;
            }
            // Configuration
            result = yield this.LoadConfigurationAsync();
            if (!result) {
                return false;
            }
            // Launch emulator or cart
            this.LaunchEmulatorOrCartOption = this.Configuration.get(`launch.emulatorOrCart`, "Emulator");
            // Activate output window?
            if (!this.Configuration.get(`editor.preserveCodeEditorFocus`)) {
                if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
                    (_a = application.AdsTerminal) === null || _a === void 0 ? void 0 : _a.show();
                }
                else {
                    application.CompilerOutputChannel.show();
                }
            }
            // Save files?
            // There appears to be an issue using SaveAll in VSCODE in certain situations
            // I often see it when editing the Compare View and it been happening for a long time
            // Bloody annoying as you need to restart the compile process due to me checking the result
            // NOTE: if this doesn't fix it long term I'm going to remove the result validation
            let repeatCounter = 0;
            do {
                if (this.Configuration.get(`editor.saveAllFilesBeforeRun`)) {
                    result = yield vscode.workspace.saveAll();
                }
                else if (this.Configuration.get(`editor.saveFileBeforeRun`)) {
                    if (this.Document) {
                        result = yield this.Document.save();
                    }
                }
                if (!result) {
                    // repeat up to 5 times
                    repeatCounter = repeatCounter + 1;
                    console.log('debugger:CompilerBase.InitialiseAsync.SaveAllFiles.RepeatCounter=' + repeatCounter);
                    if (repeatCounter > 4) {
                        console.log('debugger:CompilerBase.InitialiseAsync.SaveAllFiles something did not save as expected');
                        return false;
                    }
                }
                // put a little delay to allow the system to contine to work in the background
                yield application.Delay(500);
            } while (!result);
            // Remove old debugger files before build
            if (!this.UsingMakeFileCompiler && !this.UsingBatchCompiler && !this.UsingShellScriptCompiler) {
                yield this.RemoveDebuggerFilesAsync(this.CompiledSubFolder);
            }
            // Read compiler version (if used)
            yield this.GetCompilerVersionAsync();
            // Show any specific compiler warnings
            this.ShowAnyCompilerWarnings();
            // Result
            return true;
        });
    }
    VerifyCompilerFilesExistsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.VerifyCompilerFilesExistsAsync');
            // Prepare
            let compilerFileList = this.GetCompilerFileList();
            let result = true;
            // Process
            application.WriteToCompilerTerminal(`Verifying compiler files exist...`);
            for (let compilerFileName of compilerFileList) {
                // Prepare
                let compilerFilePath = path.join(this.FolderOrPath, compilerFileName);
                // Validate
                if (!(yield filesystem.FileExistsAsync(compilerFilePath))) {
                    // Not found
                    application.WriteToCompilerTerminal(`ERROR: Unable to locate compiler file '${compilerFileName}'. `);
                    result = false;
                }
            }
            // Failed?, 
            if (!result) {
                let message = "NOTE: your anti-virus software may have quarantined one or more files related to the compiler due to a false/positive test and where this is the case please ensure you whitelist to allow these files to used.  Alternatively try re-installing the extension.";
                application.WriteToCompilerTerminal(message);
            }
            // Result
            return result;
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows) {
                return true;
            }
            // Prepare
            let compilerFileList = this.GetCompilerFileList();
            let result = true;
            // Process
            application.WriteToCompilerTerminal(`Verifying file permissions...`);
            for (let compilerFileName of compilerFileList) {
                // Prepare
                let compilerFilePath = path.join(this.FolderOrPath, compilerFileName);
                // Validate
                if (!(yield filesystem.ChModAsync(compilerFilePath))) {
                    // Not found
                    application.WriteToCompilerTerminal(`WARNING: Unable to set file permissions for compiler file '${compilerFileName}'. `);
                    result = false;
                }
            }
            // Result
            return result;
        });
    }
    GetCompilerVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    GetCompilerFileList() {
        return [];
    }
    ShowAnyCompilerWarnings() {
    }
    LoadConfigurationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.LoadConfigurationAsync');
            // Reset
            this.CustomFolderOrPath = false;
            this.FolderOrPath = this.DefaultFolderOrPath;
            this.Args = "";
            this.Emulator = this.DefaultEmulator;
            this.UsingMakeFileCompiler = false;
            this.UsingBatchCompiler = false;
            this.UsingShellScriptCompiler = false;
            // System
            this.WorkspaceFolder = this.GetWorkspaceFolder();
            this.FileName = path.basename(this.Document.fileName);
            // Validate compilers
            console.log('debugger:CompilerBase.LoadConfigurationAsync.ValidateCompiler');
            let defaultCompiler = this.Configuration.get(`compiler.${this.Id}.defaultCompiler`);
            if (defaultCompiler === "Make") {
                // Only working in dasm currently
                // validate for one of the script files
                if (!(yield this.ValidateTerminalMakeFileAvailableAysnc())) {
                    return false;
                }
                // Initialise terminal
                yield application.InitialiseAdsTerminalAsync();
                return true;
            }
            if (defaultCompiler === "Custom") {
                // Validate
                // bB and 7800basic check for a folder, dasm checks for a path
                yield this.ValidateCustomCompilerLocationAsync();
            }
            // Compiler (other)
            this.Args = this.Configuration.get(`compiler.${this.Id}.args`, "");
            // Compilation
            this.GenerateDebuggerFiles = this.Configuration.get(`compiler.options.generateDebuggerFiles`, true);
            this.CleanUpCompilationFiles = this.Configuration.get(`compiler.options.cleanupCompilationFiles`, true);
            // System
            this.CompiledSubFolder = path.join(this.WorkspaceFolder, this.CompiledSubFolderName);
            // Result
            return true;
        });
    }
    ValidateTerminalMakeFileAvailableAysnc() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.ValidateTerminalMakeFileAvailableAysnc');
            // Makefile?
            this.UsingMakeFileCompiler = yield this.FindTerminalMakeFileAsync("makefile");
            if (!this.UsingMakeFileCompiler) {
                this.UsingMakeFileCompiler = yield this.FindTerminalMakeFileAsync("Makefile");
            }
            if (!this.UsingMakeFileCompiler) {
                this.UsingMakeFileCompiler = yield this.FindTerminalMakeFileAsync("MAKEFILE");
            }
            if (this.UsingMakeFileCompiler) {
                return true;
            }
            // Shell?
            this.UsingShellScriptCompiler = yield this.FindTerminalMakeFileAsync("makefile.sh");
            if (!this.UsingShellScriptCompiler) {
                this.UsingShellScriptCompiler = yield this.FindTerminalMakeFileAsync("Makefile.sh");
            }
            if (!this.UsingShellScriptCompiler) {
                this.UsingShellScriptCompiler = yield this.FindTerminalMakeFileAsync("MAKEFILE.SH");
            }
            if (this.UsingShellScriptCompiler) {
                return true;
            }
            // Bat?
            this.UsingBatchCompiler = yield this.FindTerminalMakeFileAsync("makefile.bat");
            if (this.UsingBatchCompiler) {
                return true;
            }
            // Nothing found
            let message = `ERROR: You have chosen to use the Make compiler for ${this.Id} but no makefile was not found in your root workspace folder.\nCreate a 'Makefile', 'makefile.bat' or 'makefile.sh' script...`;
            application.WriteToCompilerTerminal(message);
            application.ShowErrorPopup(message);
            // Exit
            return false;
        });
    }
    ValidateCustomCompilerLocationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.ValidateCustomCompilerLocationAsync');
            // Validate for a folder
            let customCompilerFolder = this.Configuration.get(`compiler.${this.Id}.folder`);
            if (!customCompilerFolder) {
                // No custom compiler provided, revert
                let message = `WARNING: You have chosen to use a custom ${this.Name} compiler but have not provided the location.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                application.ShowWarningPopup(message);
            }
            else {
                // Validate custom compiler path exists
                let result = yield filesystem.FolderExistsAsync(customCompilerFolder);
                if (!result) {
                    // Failed, revert
                    let message = `WARNING: Your custom ${this.Name} compiler location '${customCompilerFolder}' cannot be found.\nReverting to the default compiler...`;
                    application.WriteToCompilerTerminal(message);
                    application.ShowWarningPopup(message);
                }
                else {
                    // Ok
                    application.WriteToCompilerTerminal(`Building using your custom ${this.Name} compiler.`);
                    application.WriteToCompilerTerminal(`Location: ${customCompilerFolder}`);
                    // Set
                    this.FolderOrPath = customCompilerFolder;
                    this.CustomFolderOrPath = true;
                }
            }
            // Finalise
            application.WriteToCompilerTerminal("");
        });
    }
    VerifyCompiledFileSizeAsync() {
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.VerifyCompiledFileSize');
            // Validate
            if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
                return true;
            }
            // Verify created file(s)
            application.WriteToCompilerTerminal(`Verifying compiled file(s)...`);
            try {
                for (var _d = true, _e = __asyncValues(this.VerifyCompiledExtensions), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        let extension = _c;
                        // Prepare
                        let compiledFileName = `${this.FileName}${extension}`;
                        let compiledFilePath = path.join(this.WorkspaceFolder, compiledFileName);
                        // Validate
                        let fileStats = yield filesystem.GetFileStatsAsync(compiledFilePath);
                        if (fileStats && fileStats.size > 0) {
                            continue;
                        }
                        // Failed
                        application.WriteToCompilerTerminal(`ERROR: Failed to create compiled file '${compiledFileName}'.`);
                        return false;
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // Result
            return true;
        });
    }
    MoveFilesToBinFolderAsync() {
        var _a, e_4, _b, _c, _d, e_5, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            // Note: generateDebuggerFile - there are different settings for each compiler
            console.log('debugger:CompilerBase.MoveFilesToBinFolder');
            // Validate
            if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
                return true;
            }
            // Create directory?
            let result = yield filesystem.MkDirAsync(this.CompiledSubFolder);
            if (!result) {
                // Notify
                application.WriteToCompilerTerminal(`ERROR: Failed to create folder '${this.CompiledSubFolderName}'`);
                return false;
            }
            // Move compiled file(s)
            application.WriteToCompilerTerminal(`Moving compiled file(s) to '${this.CompiledSubFolderName}' folder...`);
            try {
                for (var _g = true, _h = __asyncValues(this.CompiledExtensions), _j; _j = yield _h.next(), _a = _j.done, !_a;) {
                    _c = _j.value;
                    _g = false;
                    try {
                        let extension = _c;
                        // Prepare
                        let compiledFileName = `${this.FileName}${extension}`;
                        let oldPath = path.join(this.WorkspaceFolder, compiledFileName);
                        let newPath = path.join(this.CompiledSubFolder, compiledFileName);
                        // Move compiled file
                        // Updated to check as we may now have optional files (7800basic - .CC2)
                        if (yield filesystem.FileExistsAsync(oldPath)) {
                            // Process
                            result = yield filesystem.RenameFileAsync(oldPath, newPath);
                            if (!result) {
                                // Notify
                                application.WriteToCompilerTerminal(`ERROR: Failed to move file from '${compiledFileName}' to ${this.CompiledSubFolderName} folder`);
                                return false;
                            }
                        }
                    }
                    finally {
                        _g = true;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = _h.return)) yield _b.call(_h);
                }
                finally { if (e_4) throw e_4.error; }
            }
            // Process?
            if (this.GenerateDebuggerFiles) {
                // Move all debugger files?
                application.WriteToCompilerTerminal(`Moving debugger file(s) to '${this.CompiledSubFolderName}' folder...`);
                try {
                    for (var _k = true, _l = __asyncValues(this.DebuggerExtensions), _m; _m = yield _l.next(), _d = _m.done, !_d;) {
                        _f = _m.value;
                        _k = false;
                        try {
                            let [arg, extension] = _f;
                            // Prepare
                            let debuggerFile = `${this.FileName}${extension}`;
                            let oldPath = path.join(this.WorkspaceFolder, debuggerFile);
                            let newPath = path.join(this.CompiledSubFolder, debuggerFile);
                            // Move compiled file?
                            if (yield filesystem.FileExistsAsync(oldPath)) {
                                result = yield filesystem.RenameFileAsync(oldPath, newPath);
                                if (!result) {
                                    // Notify            
                                    application.WriteToCompilerTerminal(`ERROR: Failed to move file '${debuggerFile}' to '${this.CompiledSubFolderName}' folder`);
                                }
                            }
                        }
                        finally {
                            _k = true;
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (!_k && !_d && (_e = _l.return)) yield _e.call(_l);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
            // Return
            return true;
        });
    }
    RemoveDebuggerFilesAsync(folder) {
        var _a, e_6, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');
            try {
                // Process
                for (var _d = true, _e = __asyncValues(this.DebuggerExtensions), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        let [arg, extension] = _c;
                        // Prepare
                        let debuggerFile = `${this.FileName}${extension}`;
                        let debuggerFilePath = path.join(folder, debuggerFile);
                        // Process
                        if (yield filesystem.FileExistsAsync(debuggerFilePath)) {
                            yield filesystem.RemoveFileAsync(debuggerFilePath);
                        }
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_6) throw e_6.error; }
            }
            // Result
            return true;
        });
    }
    Kill() {
        console.log('debugger:CompilerBase.Kill');
        // Validate
        if (this.IsRunning) {
            // Notify
            application.WriteToCompilerTerminal(`Attempting to kill running ${this.Name} compilation process...`);
            // Process
            this.IsRunning = false;
            execute.KillSpawnProcess();
        }
    }
    FindTerminalMakeFileAsync(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Scan for required makefile and store if found
            let result = yield filesystem.FileExistsAsync(path.join(this.WorkspaceFolder, fileName));
            if (result) {
                this.FileName = fileName;
            }
            // Return
            return result;
        });
    }
    GetWorkspaceFolder() {
        var _a;
        console.log('debugger:CompilerBase.getWorkspaceFolder');
        // Issue: Get actual document first as the workspace
        //        is not the best option when file is in a subfolder
        //        of the chosen workspace
        // Document
        let uri = (_a = this.Document) === null || _a === void 0 ? void 0 : _a.uri;
        if (this.Document) {
            return path.dirname(this.Document.fileName);
        }
        // Workspace (last resort)
        if (vscode.workspace.workspaceFolders && uri) {
            let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
            if (workspaceFolder) {
                return workspaceFolder.uri.fsPath;
            }
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return "";
    }
}
exports.CompilerBase = CompilerBase;
//# sourceMappingURL=compilerBase.js.map
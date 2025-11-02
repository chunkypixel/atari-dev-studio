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
const tags = require("../tags");
const configuration = require("../configuration");
class CompilerBase {
    constructor(id, name, extensions, compiledExtensions, verifyCompiledExtensions, folderOrPath, emulator) {
        // Features
        this.IsRunning = false;
        this.CustomFolderOrPath = false;
        this.FolderOrPath = "";
        this.Args = "";
        this.Emulator = "";
        this.CompilerVersion = 0.0;
        this.FileName = "";
        this.CompiledSubFolder = "";
        this.CompiledSubFolderName = "bin";
        this.GenerateDebuggerFiles = true;
        this.CleanUpCompilationFiles = true;
        this.CheckProjectFolderAndFileForSpaces = true;
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
            // Process
            if (!(yield this.InitialiseAsync()))
                return false;
            return yield this.ExecuteCompilerAsync();
        });
    }
    BuildGameAndRunAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c, _d, e_2, _e, _f;
            // Process
            const result = yield this.BuildGameAsync(document);
            if (!result)
                return false;
            // Does compiler have/use an emulator?
            // Make doesn't use an emulator - user must provide their own
            if (this.Emulator === '' || (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler))
                return true;
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
                        for (var _g = true, _h = __asyncValues(application.Serials), _j; _j = yield _h.next(), _a = _j.done, !_a; _g = true) {
                            _c = _j.value;
                            _g = false;
                            const serial = _c;
                            if (serial.Id === this.LaunchEmulatorOrCartOption) {
                                // Match
                                const compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                                return yield serial.SendGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
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
                for (var _k = true, _l = __asyncValues(application.Emulators), _m; _m = yield _l.next(), _d = _m.done, !_d; _k = true) {
                    _f = _m.value;
                    _k = false;
                    const emulator = _f;
                    if (emulator.Id === this.Emulator) {
                        // Note: first extension should be the one which is to be launched
                        const compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                        return yield emulator.RunGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
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
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('debugger:CompilerBase.InitialiseAsync');
            // Prepare
            let result = true;
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = configuration.GetAtariDevStudioConfiguration();
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
            // Write system and VSCode version to log
            application.WriteEnvironmentSummaryToCompilerTerminal();
            // Configuration
            result = yield this.LoadConfigurationAndSettingsAsync();
            if (!result)
                return false;
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
            // Save files (based on user configuration)
            result = yield this.SaveAllFilesBeforeRun();
            if (!result)
                return false;
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
    SaveAllFilesBeforeRun() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Prepare
            let result = true;
            let repeatCounter = 0;
            // NOTE: turning off files.AutoSave may help in this area
            // There appears to be an issue using SaveAll in VSCODE in certain situations
            // I often see it when editing the Compare View and it been happening for a long time
            // Bloody annoying as you need to restart the compile process due to me checking the result
            // NOTE: if this doesn't fix it long term I'm going to remove the result validation
            do {
                // Attempt to save
                if ((_a = this.Configuration) === null || _a === void 0 ? void 0 : _a.get(`editor.saveAllFilesBeforeRun`)) {
                    result = yield vscode.workspace.saveAll();
                }
                else if ((_b = this.Configuration) === null || _b === void 0 ? void 0 : _b.get(`editor.saveFileBeforeRun`)) {
                    if (this.Document)
                        result = yield this.Document.save();
                }
                // Failed?
                if (!result) {
                    // repeat up to 5 times
                    repeatCounter = repeatCounter + 1;
                    console.log(`debugger:CompilerBase.SaveFileBeforeRun.RepeatCounter=${repeatCounter}`);
                    if (repeatCounter > 4) {
                        const message = "WARNING: It appears one or more of your unsaved documents did not save as expected.";
                        application.WriteToCompilerTerminal(message);
                        console.log(`debugger:CompilerBase.SaveFileBeforeRun ${message}`);
                        return false;
                    }
                    // put in a little delay
                    yield application.Delay(250);
                }
            } while (!result);
            // return
            return true;
        });
    }
    VerifyCompilerFilesAndPermissionsExistsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.VerifyCompilerFilesAndPermissionsExistsAsync');
            // Process
            application.WriteToCompilerTerminal(`Verifying compiler files and permissions...`);
            for (const compilerFileName of this.GetCompilerFileList()) {
                // Prepare
                const compilerFilePath = path.join(this.FolderOrPath, compilerFileName);
                // Validate exists
                if (!(yield filesystem.FileExistsAsync(compilerFilePath))) {
                    // Not found
                    application.WriteToCompilerTerminal(`ERROR: Unable to locate compiler file '${compilerFileName}'. `);
                    return false;
                }
                // Continue??
                if (application.IsWindows)
                    continue;
                // Validate permissions? (not windows)
                if (!(yield filesystem.ChModAsync(compilerFilePath))) {
                    // Not found
                    application.WriteToCompilerTerminal(`WARNING: Unable to set file permissions for compiler file '${compilerFileName}'. `);
                    // NOTE: don't fail here as it may still work... (an error will be shown if the script cannot access)  
                    //return false; 
                }
            }
            // Result
            return true;
        });
    }
    GetCompilerVersionAsync() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    GetCompilerFileList() {
        return [];
    }
    GetDebuggerFileList() {
        return new Map();
    }
    ShowAnyCompilerWarnings() {
    }
    LoadConfigurationAndSettingsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.LoadConfigurationAndSettingsAsync');
            // Reset
            this.CustomFolderOrPath = false;
            this.FolderOrPath = this.DefaultFolderOrPath;
            this.Args = '';
            this.Emulator = this.DefaultEmulator;
            this.UsingMakeFileCompiler = false;
            this.UsingBatchCompiler = false;
            this.UsingShellScriptCompiler = false;
            // System
            this.WorkspaceFolder = this.GetWorkspaceFolder();
            this.FileName = path.basename(this.Document.fileName);
            // Check document for compiler tag: currently Default,Make,Custom,Other
            const adsCompilerTag = tags.ScanDocumentForADSCompilerTag(this.Id, this.Document);
            // Get default chosen compiler
            console.log('debugger:CompilerBase.LoadConfigurationAsync.ValidateCompiler');
            // Override with document tag?
            let chosenCompiler = this.Configuration.get(`compiler.${this.Id}.defaultCompiler`, '');
            if (adsCompilerTag)
                chosenCompiler = adsCompilerTag;
            // Validate chosen compiler
            switch (chosenCompiler.toLowerCase()) {
                case "make":
                    // Only working in dasm currently
                    // validate for one of the script files
                    const result = yield this.ValidateTerminalMakeFileAvailableAysnc();
                    if (result)
                        yield application.InitialiseAdsTerminalAsync();
                    return result;
                case "default":
                    // do nothing
                    break;
                default:
                    // custom or everything else
                    // bB and 7800basic check for a folder, dasm checks for a path
                    yield this.ValidateCustomCompilerLocationAsync(chosenCompiler);
                    break;
            }
            // Compiler (other)
            this.Args = this.Configuration.get(`compiler.${this.Id}.args`, "");
            // Compilation
            this.GenerateDebuggerFiles = this.Configuration.get(`compiler.options.generateDebuggerFiles`, true);
            this.CleanUpCompilationFiles = this.Configuration.get(`compiler.options.cleanupCompilationFiles`, true);
            this.CheckProjectFolderAndFileForSpaces = this.Configuration.get(`compiler.options.validateIfProjectFolderAndFileContainsSpaces`, true);
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
            if (!this.UsingMakeFileCompiler)
                this.UsingMakeFileCompiler = yield this.FindTerminalMakeFileAsync("Makefile");
            if (!this.UsingMakeFileCompiler)
                this.UsingMakeFileCompiler = yield this.FindTerminalMakeFileAsync("MAKEFILE");
            if (this.UsingMakeFileCompiler)
                return true;
            // Shell?
            this.UsingShellScriptCompiler = yield this.FindTerminalMakeFileAsync("makefile.sh");
            if (!this.UsingShellScriptCompiler)
                this.UsingShellScriptCompiler = yield this.FindTerminalMakeFileAsync("Makefile.sh");
            if (!this.UsingShellScriptCompiler)
                this.UsingShellScriptCompiler = yield this.FindTerminalMakeFileAsync("MAKEFILE.SH");
            if (this.UsingShellScriptCompiler)
                return true;
            // Bat?
            this.UsingBatchCompiler = yield this.FindTerminalMakeFileAsync("makefile.bat");
            if (this.UsingBatchCompiler)
                return true;
            // Nothing found
            const message = `ERROR: You have chosen to use the Make compiler for ${this.Id} but no makefile was not found in your root workspace folder.\nCreate a 'Makefile', 'makefile.bat' or 'makefile.sh' script...`;
            application.WriteToCompilerTerminal(message);
            application.ShowErrorPopup(message);
            // Exit
            return false;
        });
    }
    ValidateCustomCompilerLocationAsync(customCompilerId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.ValidateCustomCompilerLocationAsync');
            // Validate for custom compiler tag
            const customCompilerTagExists = configuration.ContainsCustomCompilerTag(this.Id, customCompilerId);
            if (!customCompilerTagExists) {
                // No tag found, revert
                const message = `WARNING: Unable to find your selected custom ${this.Name} compiler (${customCompilerId}) in the settings.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                return;
            }
            // Get the folder to the custom compiler
            const customCompilerFolder = configuration.GetCustomCompilerFolder(this.Id, customCompilerId);
            // Validate if folder provided exists
            if (!customCompilerFolder) {
                // No, revert
                const message = `WARNING: The path of your selected custom ${this.Name} compiler (${customCompilerId}) has not been configured in the settings.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                return;
            }
            // Validate custom compiler path exists
            const result = yield filesystem.FolderExistsAsync(customCompilerFolder);
            if (!result) {
                // No, revert
                const message = `WARNING: The path of your selected custom ${this.Name} compiler (${customCompilerId}) cannot be found '${customCompilerFolder}'.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                return;
            }
            // Success!
            application.WriteToCompilerTerminal(`Building project using custom ${this.Name} compiler (${customCompilerId}).`);
            // Set
            this.FolderOrPath = customCompilerFolder;
            this.CustomFolderOrPath = true;
        });
    }
    ValidateIfProjectFolderAndFileContainsSpaces() {
        console.log('debugger:CompilerBase.ValidateIfProjectFolderAndFileContainsSpaces');
        // process?
        if (this.CheckProjectFolderAndFileForSpaces) {
            if (this.WorkspaceFolder.includes(' ')) {
                application.WriteToCompilerTerminal(`WARNING: The path of your project contains spaces which can potentially cause compilation issues.`);
            }
            else if (this.FileName.includes(' ')) {
                application.WriteToCompilerTerminal(`WARNING: The filename of your project file contains spaces which can potentially cause compilation issues.`);
            }
        }
    }
    VerifyCompiledFileSizeAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_3, _b, _c;
            console.log('debugger:CompilerBase.VerifyCompiledFileSize');
            // Validate
            if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler)
                return true;
            // Verify created file(s)
            application.WriteToCompilerTerminal(`Verifying compiled file(s)...`);
            try {
                for (var _d = true, _e = __asyncValues(this.VerifyCompiledExtensions), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const extension = _c;
                    // Prepare
                    const compiledFileName = `${this.FileName}${extension}`;
                    const compiledFilePath = path.join(this.WorkspaceFolder, compiledFileName);
                    // Validate
                    const fileStats = yield filesystem.GetFileStatsAsync(compiledFilePath);
                    if (fileStats && fileStats.size > 0)
                        continue;
                    // Failed
                    application.WriteToCompilerTerminal(`ERROR: Failed to create compiled file '${compiledFileName}'.`);
                    return false;
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
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_4, _b, _c, _d, e_5, _e, _f;
            // Note: generateDebuggerFile - there are different settings for each compiler
            console.log('debugger:CompilerBase.MoveFilesToBinFolder');
            // Validate
            if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler)
                return true;
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
                for (var _g = true, _h = __asyncValues(this.CompiledExtensions), _j; _j = yield _h.next(), _a = _j.done, !_a; _g = true) {
                    _c = _j.value;
                    _g = false;
                    let extension = _c;
                    // Prepare
                    let compiledFileName = `${this.FileName}${extension}`;
                    // leading minus (-)? if so strip any existing extensions from filename before adding
                    // There is a specific requirement for the 7800basic compiler
                    if (extension.startsWith("-")) {
                        // remove minus (-)
                        extension = extension.slice(1);
                        compiledFileName = `${path.parse(this.FileName).name}${extension}`;
                    }
                    // set path
                    const oldPath = path.join(this.WorkspaceFolder, compiledFileName);
                    const newPath = path.join(this.CompiledSubFolder, compiledFileName);
                    // Move compiled file
                    // Updated to check as we may now have optional files (7800basic - .CC2, bB - .ace)
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
                // Prepare
                application.WriteToCompilerTerminal(`Moving debugger file(s) to '${this.CompiledSubFolderName}' folder...`);
                try {
                    // Move all debugger files
                    for (var _k = true, _l = __asyncValues(this.GetDebuggerFileList()), _m; _m = yield _l.next(), _d = _m.done, !_d; _k = true) {
                        _f = _m.value;
                        _k = false;
                        const [arg, extension] = _f;
                        // Prepare
                        const debuggerFileName = `${this.FileName}${extension}`;
                        // Set path
                        const oldPath = path.join(this.WorkspaceFolder, debuggerFileName);
                        const newPath = path.join(this.CompiledSubFolder, debuggerFileName);
                        // Move compiled file?
                        if (yield filesystem.FileExistsAsync(oldPath)) {
                            result = yield filesystem.RenameFileAsync(oldPath, newPath);
                            if (!result) {
                                // Notify            
                                application.WriteToCompilerTerminal(`ERROR: Failed to move file '${debuggerFileName}' to '${this.CompiledSubFolderName}' folder`);
                            }
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
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_6, _b, _c;
            console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');
            try {
                // Process
                for (var _d = true, _e = __asyncValues(this.GetDebuggerFileList()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const [arg, extension] = _c;
                    // Prepare
                    const debuggerFile = `${this.FileName}${extension}`;
                    const debuggerFilePath = path.join(folder, debuggerFile);
                    // Process
                    if (yield filesystem.FileExistsAsync(debuggerFilePath)) {
                        yield filesystem.RemoveFileAsync(debuggerFilePath);
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
            const result = yield filesystem.FileExistsAsync(path.join(this.WorkspaceFolder, fileName));
            if (result)
                this.FileName = fileName;
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
        if (this.Document)
            return path.dirname(this.Document.fileName);
        // Workspace (last resort)
        if (vscode.workspace.workspaceFolders && uri) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
            if (workspaceFolder)
                return workspaceFolder.uri.fsPath;
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return "";
    }
}
exports.CompilerBase = CompilerBase;
//# sourceMappingURL=compilerBase.js.map
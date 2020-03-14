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
const vscode = require("vscode");
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
class CompilerBase {
    constructor(id, name, extensions, compiledExtensions, folderOrPath, emulator) {
        // Features
        this.IsRunning = false;
        // Note: these need to be in reverse order compared to how they are read
        this.DebuggerExtensions = new Map([["-s", ".sym"], ["-l", ".lst"]]);
        this.CustomFolderOrPath = false;
        this.FolderOrPath = "";
        this.Args = "";
        this.Emulator = "";
        this.FileName = "";
        this.CompiledSubFolder = "";
        this.CompiledSubFolderName = "bin";
        this.GenerateDebuggerFiles = false;
        this.CleanUpCompilationFiles = false;
        this.WorkspaceFolder = "";
        this.UsingMakeFile = false;
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
        this.CompiledExtensions = compiledExtensions;
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
            let result = yield this.InitialiseAsync();
            if (!result) {
                return false;
            }
            return yield this.ExecuteCompilerAsync();
        });
    }
    BuildGameAndRunAsync(document) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            let result = yield this.BuildGameAsync(document);
            if (!result) {
                return false;
            }
            // Does compiler have/use an emulator?
            // Make doesn't use an emulator - user must provide their own
            if (this.Emulator === '' || this.UsingMakeFile)
                return true;
            try {
                // Get emulator
                for (var _b = __asyncValues(application.Emulators), _c; _c = yield _b.next(), !_c.done;) {
                    let emulator = _c.value;
                    if (emulator.Id === this.Emulator) {
                        // Note: first extension should be the one which is to be launched
                        let compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                        return yield emulator.RunGameAsync(path.join(this.CompiledSubFolder, compiledFileName));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Not found
            application.Notify(`Unable to find emulator '${this.Emulator}' to launch game.`);
            return false;
        });
    }
    InitialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.InitialiseAsync');
            // Prepare
            let result = true;
            // Already running?
            if (this.IsRunning) {
                // Notify
                application.Notify(`The ${this.Name} compiler is already running! If you need to cancel the compilation process use the 'ads: Kill build process' option from the Command Palette.`);
                return false;
            }
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = application.GetConfiguration();
            // Activate output window?
            if (!this.Configuration.get(`editor.preserveCodeEditorFocus`)) {
                if (!this.UsingMakeFile) {
                    application.CompilerOutputChannel.show();
                }
                else {
                    application.MakeTerminal.show();
                }
            }
            // Clear output content?
            if (this.Configuration.get(`editor.clearPreviousOutput`)) {
                if (!this.UsingMakeFile)
                    application.CompilerOutputChannel.clear();
            }
            // Save files?
            if (this.Configuration.get(`editor.saveAllFilesBeforeRun`)) {
                result = yield vscode.workspace.saveAll();
            }
            else if (this.Configuration.get(`editor.saveFileBeforeRun`)) {
                if (this.Document) {
                    result = yield this.Document.save();
                }
            }
            if (!result) {
                return false;
            }
            // Configuration
            result = yield this.LoadConfigurationAsync();
            if (!result) {
                return false;
            }
            // Remove old debugger files before build
            yield this.RemoveDebuggerFilesAsync(this.CompiledSubFolder);
            // Result
            return true;
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    LoadConfigurationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.LoadConfigurationAsync');
            // Reset
            this.CustomFolderOrPath = false;
            this.FolderOrPath = this.DefaultFolderOrPath;
            this.Args = "";
            this.Emulator = this.DefaultEmulator;
            // System
            this.WorkspaceFolder = this.getWorkspaceFolder();
            this.FileName = path.basename(this.Document.fileName);
            // Are we using the built-in or custom compiler?
            let defaultCompiler = this.Configuration.get(`compiler.${this.Id}.defaultCompiler`);
            if (defaultCompiler === "Make") {
                // Only working is dasm currently
                this.UsingMakeFile = yield this.HasMakeFileAsync();
                if (!this.UsingMakeFile) {
                    // Failed
                    application.Notify(`Error: You have chosen to use the Make compiler for ${this.Id} but no Makefile was found your root workspace folder. Review your selection in ${application.PreferencesSettingsExtensionPath}.`);
                    application.Notify(`Workspace folder: ${this.WorkspaceFolder}`);
                    return false;
                }
            }
            if (defaultCompiler === "Custom") {
                let customCompilerFolder = this.Configuration.get(`compiler.${this.Id}.folder`);
                if (!customCompilerFolder) {
                    // No custom compiler provided, revert
                    application.Notify(`WARNING: You have chosen to use a custom ${this.Name} compiler but have not provided the location. Reverting to the default compiler instead.`);
                    application.Notify("");
                }
                else {
                    // Validate custom compiler path exists
                    let result = yield filesystem.FolderExistsAsync(customCompilerFolder);
                    if (!result) {
                        // Failed
                        application.Notify(`ERROR: Cannot locate your chosen custom ${this.Name} compiler folder '${customCompilerFolder}'. Review your selection in ${application.PreferencesSettingsExtensionPath}.`);
                    }
                    else {
                        // Ok
                        application.Notify(`NOTE: Building your program using your chosen custom ${this.Name} compiler.`);
                        application.Notify("");
                    }
                    // Set
                    this.FolderOrPath = customCompilerFolder;
                    this.CustomFolderOrPath = true;
                }
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
    VerifyCompiledFileSizeAsync() {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.VerifyCompiledFileSize');
            // Validate
            if (this.UsingMakeFile) {
                return true;
            }
            // Verify created file(s)
            application.Notify(`Verifying compiled file(s)...`);
            try {
                for (var _b = __asyncValues(this.CompiledExtensions), _c; _c = yield _b.next(), !_c.done;) {
                    let extension = _c.value;
                    // Prepare
                    let compiledFileName = `${this.FileName}${extension}`;
                    let compiledFilePath = path.join(this.WorkspaceFolder, compiledFileName);
                    // Validate
                    let fileStats = yield filesystem.GetFileStatsAsync(compiledFilePath);
                    if (fileStats && fileStats.size > 0) {
                        continue;
                    }
                    // Failed
                    application.Notify(`ERROR: Failed to create compiled file '${compiledFileName}'.`);
                    return false;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // Result
            return true;
        });
    }
    MoveFilesToBinFolderAsync() {
        var e_3, _a, e_4, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Note: generateDebuggerFile - there are different settings for each compiler
            console.log('debugger:CompilerBase.MoveFilesToBinFolder');
            // Validate
            if (this.UsingMakeFile) {
                return true;
            }
            // Create directory?
            let result = yield filesystem.MkDirAsync(this.CompiledSubFolder);
            if (!result) {
                // Notify
                application.Notify(`ERROR: Failed to create folder '${this.CompiledSubFolderName}'`);
                return false;
            }
            // Move compiled file(s)
            application.Notify(`Moving compiled file(s) to '${this.CompiledSubFolderName}' folder...`);
            try {
                for (var _c = __asyncValues(this.CompiledExtensions), _d; _d = yield _c.next(), !_d.done;) {
                    let extension = _d.value;
                    // Prepare
                    let compiledFileName = `${this.FileName}${extension}`;
                    let oldPath = path.join(this.WorkspaceFolder, compiledFileName);
                    let newPath = path.join(this.CompiledSubFolder, compiledFileName);
                    // Move compiled file
                    result = yield filesystem.RenameFileAsync(oldPath, newPath);
                    if (!result) {
                        // Notify
                        application.Notify(`ERROR: Failed to move file from '${compiledFileName}' to ${this.CompiledSubFolderName} folder`);
                        return false;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) yield _a.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // Process?
            if (this.GenerateDebuggerFiles) {
                // Move all debugger files?
                application.Notify(`Moving debugger file(s) to '${this.CompiledSubFolderName}' folder...`);
                try {
                    for (var _e = __asyncValues(this.DebuggerExtensions), _f; _f = yield _e.next(), !_f.done;) {
                        let [arg, extension] = _f.value;
                        // Prepare
                        let debuggerFile = `${this.FileName}${extension}`;
                        let oldPath = path.join(this.WorkspaceFolder, debuggerFile);
                        let newPath = path.join(this.CompiledSubFolder, debuggerFile);
                        // Move compiled file
                        result = yield filesystem.RenameFileAsync(oldPath, newPath);
                        if (!result) {
                            // Notify            
                            application.Notify(`ERROR: Failed to move file '${debuggerFile}' to '${this.CompiledSubFolderName}' folder`);
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) yield _b.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
            // Return
            return true;
        });
    }
    RemoveDebuggerFilesAsync(folder) {
        var e_5, _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');
            // Validate
            if (this.UsingMakeFile) {
                return true;
            }
            try {
                // Process
                for (var _b = __asyncValues(this.DebuggerExtensions), _c; _c = yield _b.next(), !_c.done;) {
                    let [arg, extension] = _c.value;
                    // Prepare
                    let debuggerFile = `${this.FileName}${extension}`;
                    let debuggerFilePath = path.join(folder, debuggerFile);
                    // Process
                    yield filesystem.RemoveFileAsync(debuggerFilePath);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
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
            application.Notify(`Attempting to kill running ${this.Name} compilation process...`);
            // Process
            this.IsRunning = false;
            execute.KillSpawnProcess();
        }
    }
    HasMakeFileAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.HasMakeFileAsync');
            // scan
            var result = yield filesystem.FileExistsAsync(path.join(this.WorkspaceFolder, "makefile"));
            // add some additional checks for Linux/macOS
            if (application.IsLinux || application.IsMacOS) {
                if (!result) {
                    result = yield filesystem.FileExistsAsync(path.join(this.WorkspaceFolder, "Makefile"));
                }
                if (!result) {
                    result = yield filesystem.FileExistsAsync(path.join(this.WorkspaceFolder, "MAKEFILE"));
                }
            }
            // Result
            return result;
        });
    }
    getWorkspaceFolder() {
        console.log('debugger:CompilerBase.getWorkspaceFolder');
        // Issue: Get actual document first as the workspace
        //        is not the best option when file is in a subfolder
        //        of the chosen workspace
        // Document
        if (this.Document) {
            return path.dirname(this.Document.fileName);
        }
        // Workspace (last resort)
        if (vscode.workspace.workspaceFolders) {
            if (this.Document) {
                let workspaceFolder = vscode.workspace.getWorkspaceFolder(this.Document.uri);
                if (workspaceFolder) {
                    return workspaceFolder.uri.fsPath;
                }
            }
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return "";
    }
}
exports.CompilerBase = CompilerBase;
//# sourceMappingURL=compilerBase.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
const path = require("path");
const vscode = require("vscode");
const application = require("../application");
const filesystem = require("../filesystem");
class CompilerBase {
    constructor(id, name, extensions, compiledExtensions, folderOrPath, emulator) {
        // features
        this.IsRunning = false;
        // Note: these need to be in reverse order compared to how they are read
        this.DebuggerExtensions = new Map([["-s", ".sym"], ["-l", ".lst"]]);
        this.CustomFolderOrPath = false;
        this.FolderOrPath = "";
        this.Args = "";
        this.Format = "";
        this.Verboseness = "";
        this.Emulator = "";
        this.FileName = "";
        this.CompiledSubFolder = "";
        this.CompiledSubFolderName = "bin";
        this.GenerateDebuggerFiles = false;
        this.CleanUpCompilationFiles = false;
        this.WorkspaceFolder = "";
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
        this.CompiledExtensions = compiledExtensions;
        this.DefaultFolderOrPath = folderOrPath;
        this.DefaultEmulator = emulator;
    }
    ;
    dispose() {
        console.log('debugger:CompilerBase.dispose');
    }
    BuildGameAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set
            this.Document = document;
            // Process
            let result = yield this.InitialiseAsync();
            if (!result)
                return false;
            return yield this.ExecuteCompilerAsync();
        });
    }
    BuildGameAndRunAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            // Process
            let result = yield this.BuildGameAsync(document);
            if (!result)
                return false;
            try {
                // Get emulator
                for (var _b = __asyncValues(application.Emulators), _c; _c = yield _b.next(), !_c.done;) {
                    let emulator = _c.value;
                    if (emulator.Id === this.Emulator) {
                        // Note: first extension should be the one which is to be lauched
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
            // Result
            return true;
        });
    }
    InitialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.InitialiseAsync');
            // Already running?
            if (this.IsRunning) {
                // Notify
                application.Notify(`The ${this.Name} compiler is already running! If you want to cancel the compilation activate the Stop/Kill command.`);
                return false;
            }
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = vscode.workspace.getConfiguration(application.Name, null);
            // Activate output window?
            if (!this.Configuration.get(`editor.preserveCodeEditorFocus`)) {
                application.CompilerOutputChannel.show();
            }
            // Clear output content?
            if (this.Configuration.get(`editor.clearPreviousOutput`)) {
                application.CompilerOutputChannel.clear();
            }
            // Save files?
            if (this.Configuration.get(`editor.saveAllFilesBeforeRun`)) {
                vscode.workspace.saveAll();
            }
            else if (this.Configuration.get(`editor.saveFileBeforeRun`)) {
                if (this.Document)
                    this.Document.save();
            }
            // Configuration
            let result = yield this.LoadConfigurationAsync();
            if (!result)
                return false;
            // Remove old debugger file before build
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
            this.Format = "";
            this.Verboseness = "";
            this.Emulator = this.DefaultEmulator;
            // Compiler
            let userCompilerFolder = this.Configuration.get(`compiler.${this.Id}.folder`);
            if (userCompilerFolder) {
                // Validate (user provided)
                let result = yield filesystem.FolderExistsAsync(userCompilerFolder);
                if (!result) {
                    // Notify
                    application.Notify(`ERROR: Cannot locate your chosen ${this.Name} compiler folder '${userCompilerFolder}'. Review your selection in Preference -> Extensions -> ${application.DisplayName}.`);
                    return false;
                }
                // Set
                this.FolderOrPath = userCompilerFolder;
                this.CustomFolderOrPath = true;
            }
            // Compiler (other)
            this.Args = this.Configuration.get(`compiler.${this.Id}.args`, "");
            this.Format = this.Configuration.get(`compiler.${this.Id}.format`, "3");
            this.Verboseness = this.Configuration.get(`compiler.${this.Id}.verboseness`, "0");
            // Compilation
            this.GenerateDebuggerFiles = this.Configuration.get(`compiler.options.generateDebuggerFiles`, true);
            this.CleanUpCompilationFiles = this.Configuration.get(`compiler.options.cleanupCompilationFiles`, true);
            // System
            this.WorkspaceFolder = this.getWorkspaceFolder();
            this.FileName = path.basename(this.Document.fileName);
            this.CompiledSubFolder = path.join(this.WorkspaceFolder, this.CompiledSubFolderName);
            // Result
            return true;
        });
    }
    VerifyCompiledFileSizeAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var e_2, _a;
            console.log('debugger:CompilerBase.VerifyCompiledFileSize');
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
                    if (fileStats && fileStats.size > 0)
                        continue;
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
            ;
            // Result
            return true;
        });
    }
    MoveFilesToBinFolderAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var e_3, _a, e_4, _b;
            // Note: generateDebuggerFile - there are different settings for each compiler
            console.log('debugger:CompilerBase.MoveFilesToBinFolder');
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
            ;
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
                        ;
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
        return __awaiter(this, void 0, void 0, function* () {
            var e_5, _a;
            console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');
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
    getWorkspaceFolder() {
        console.log('debugger:CompilerBase.getWorkspaceFolder');
        // Issue: Get actual document first as the workspace
        //        is not the best option when file is in a subfolder
        //        of the chosen workspace
        // Document
        if (this.Document)
            return path.dirname(this.Document.fileName);
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
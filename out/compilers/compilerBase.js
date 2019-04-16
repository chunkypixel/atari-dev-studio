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
const vscode = require("vscode");
const application = require("../application");
const filesystem = require("../filesystem");
class CompilerBase {
    constructor(id, name, extensions, folderOrPath, emulator) {
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
        this.CompiledFileName = "";
        this.CompiledSubFolder = "";
        this.CompiledExtensionName = ".bin";
        this.CompiledSubFolderName = "bin";
        this.GenerateDebuggerFiles = false;
        this.CleanUpCompilationFiles = false;
        this.WorkspaceFolder = "";
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
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
            if (!(yield this.InitialiseAsync()))
                return false;
            return yield this.ExecuteCompilerAsync();
        });
    }
    BuildGameAndRunAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            if (!(yield this.BuildGameAsync(document)))
                return false;
            // Get emulator
            for (const emulator of application.Emulators) {
                if (emulator.Id === this.Emulator) {
                    return yield emulator.RunGameAsync(path.join(this.CompiledSubFolder, this.CompiledFileName));
                }
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
            // Configuration
            if (!(yield this.LoadConfigurationAsync()))
                return false;
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
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = vscode.workspace.getConfiguration(application.Name, null);
            // Compiler
            let userCompilerFolder = this.Configuration.get(`${this.Id}.compilerFolder`);
            if (userCompilerFolder) {
                // Validate (user provided)
                if (!(yield filesystem.FolderExistsAsync(userCompilerFolder))) {
                    // Notify
                    application.Notify(`ERROR: Cannot locate your chosen ${this.Name} compiler folder '${userCompilerFolder}'`);
                    return false;
                }
                // Set
                this.FolderOrPath = userCompilerFolder;
                this.CustomFolderOrPath = true;
            }
            // Compiler (other)
            this.Args = this.Configuration.get(`${this.Id}.compilerArgs`, "");
            this.Format = this.Configuration.get(`${this.Id}.compilerFormat`, "3");
            this.Verboseness = this.Configuration.get(`${this.Id}.compilerVerboseness`, "0");
            // Compilation
            this.GenerateDebuggerFiles = this.Configuration.get(`compilation.generateDebuggerFiles`, true);
            this.CleanUpCompilationFiles = this.Configuration.get(`compilation.cleanupCompilationFiles`, true);
            // System
            this.WorkspaceFolder = this.getWorkspaceFolder();
            this.FileName = path.basename(this.Document.fileName);
            this.CompiledFileName = `${this.FileName}${this.CompiledExtensionName}`;
            this.CompiledSubFolder = path.join(this.WorkspaceFolder, this.CompiledSubFolderName);
            // Result
            return true;
        });
    }
    VerifyCompiledFileSizeAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.VerifyCompiledFileSize');
            // Prepare
            let compiledFilePath = path.join(this.WorkspaceFolder, this.CompiledFileName);
            // Process
            let fileStats = yield filesystem.GetFileStatsAsync(compiledFilePath);
            if (fileStats) {
                // Validate
                if (fileStats.size > 0) {
                    return true;
                }
                // Notify
                application.Notify(`ERROR: Failed to create compiled file '${this.CompiledFileName}'. The file size is 0 bytes...`);
            }
            // Failed
            application.Notify(`ERROR: Failed to create compiled file '${this.CompiledFileName}'.`);
            return false;
        });
    }
    MoveFilesToBinFolderAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // Note: generateDebuggerFile - there are different settings for each compiler
            console.log('debugger:CompilerBase.MoveFilesToBinFolder');
            // Create directory?
            let result = yield filesystem.MkDirAsync(this.CompiledSubFolder);
            if (!result) {
                // Notify
                application.Notify(`ERROR: Failed to create folder '${this.CompiledSubFolderName}'`);
                return false;
            }
            // Notify
            application.Notify(`Moving compiled file '${this.CompiledFileName}' to '${this.CompiledSubFolderName}' folder...`);
            // Prepare
            let oldPath = path.join(this.WorkspaceFolder, this.CompiledFileName);
            let newPath = path.join(this.CompiledSubFolder, this.CompiledFileName);
            // Move compiled file
            result = yield filesystem.RenameFileAsync(oldPath, newPath);
            if (!result) {
                // Notify
                application.Notify(`ERROR: Failed to move file from '${this.CompiledFileName}' to ${this.CompiledSubFolderName} folder`);
                return false;
            }
            // Move all debugger files?
            if (this.GenerateDebuggerFiles) {
                // Notify
                application.Notify(`Moving debugger files to '${this.CompiledSubFolderName}' folder...`);
                // Process
                this.DebuggerExtensions.forEach((extension, arg) => __awaiter(this, void 0, void 0, function* () {
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
                }));
            }
            // Return
            return true;
        });
    }
    RemoveDebuggerFilesAsync(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');
            // Process
            this.DebuggerExtensions.forEach((extension, arg) => __awaiter(this, void 0, void 0, function* () {
                // Prepare
                let debuggerFile = `${this.FileName}${extension}`;
                let debuggerFilePath = path.join(folder, debuggerFile);
                // Process
                yield filesystem.RemoveFileAsync(debuggerFilePath);
            }));
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
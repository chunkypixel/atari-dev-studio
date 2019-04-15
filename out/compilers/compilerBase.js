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
const cp = require("child_process");
const os = require("os");
class CompilerBase {
    constructor(compilerName, compilerExtensions, compilerFolder) {
        // features
        this.IsRunning = false;
        this.CustomCompilerFolder = false;
        this.CompilerFolder = "";
        this.CompilerArgs = "";
        this.CompilerFormat = "";
        this.CompilerVerboseness = "";
        this.channelName = "compiler";
        this.outputChannel = vscode.window.createOutputChannel(this.channelName);
        this.configuration = vscode.workspace.getConfiguration(application.ExtensionId, null);
        this.WorkspaceFolder = "";
        this.CompilerName = compilerName;
        this.CompilerExtensions = compilerExtensions;
        this.DefaultCompilerFolder = compilerFolder;
    }
    dispose() {
        console.log('debugger:CompilerBase.dispose');
    }
    BuildGameAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set
            this.Document = document;
            // Process
            if (yield !this.InitialiseAsync())
                return false;
            return yield this.ExecuteCompilerAsync();
        });
    }
    BuildGameAndRunAsync(document) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            if (yield !this.BuildGameAsync(document))
                return false;
            // TODO: launch emulator here
            return true;
        });
    }
    InitialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:CompilerBase.InitialiseConfigurationAsync');
            // Already running?
            if (this.IsRunning) {
                let message = `The compiler is already running! If you want to cancel the compilation activate the Stop/Kill command.`;
                vscode.window.showErrorMessage(message);
                console.log(`debugger:${message}`);
            }
            // Configuration
            if (!(yield this.LoadConfiguration()))
                return false;
            // Activate output window?
            if (!this.configuration.get("editor.preserveCodeEditorFocus")) {
                this.outputChannel.show();
            }
            // Clear output content?
            if (this.configuration.get("editor.clearPreviousOutput")) {
                this.outputChannel.clear();
            }
            // Save files?
            if (this.configuration.get("editor.saveAllFilesBeforeRun")) {
                vscode.workspace.saveAll();
            }
            else if (this.configuration.get("editor.saveFileBeforeRun")) {
                if (this.Document)
                    this.Document.save();
            }
            // Result
            return true;
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    LoadConfiguration() {
        console.log('debugger:CompilerBase.LoadConfiguration');
        // Reset
        this.CustomCompilerFolder = false;
        this.CompilerFolder = this.DefaultCompilerFolder;
        this.CompilerArgs = "";
        this.CompilerFormat = "";
        this.CompilerVerboseness = "";
        // Other
        this.WorkspaceFolder = this.getWorkspaceFolder();
        // Result
        return true;
    }
    getWorkspaceFolder() {
        console.log('debugger:CompilerBase.getWorkspaceFolder');
        // Workspace
        if (vscode.workspace.workspaceFolders) {
            if (this.Document) {
                let workspaceFolder = vscode.workspace.getWorkspaceFolder(this.Document.uri);
                if (workspaceFolder) {
                    return workspaceFolder.uri.fsPath;
                }
            }
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        // Document
        if (this.Document)
            return path.dirname(this.Document.fileName);
        return "";
    }
}
exports.CompilerBase = CompilerBase;
//# sourceMappingURL=compilerBase.js.map
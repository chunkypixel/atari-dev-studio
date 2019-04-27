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
const vscode = require("vscode");
const application = require("./application");
const fs = require("fs");
//export let error: NodeJS.ErrnoException = null;
function GetFileUriAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate
        if (fileUri)
            return fileUri;
        // Prepare
        let document;
        // Document not open?
        // Note: this really shouldn't happen
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            document = yield vscode.workspace.openTextDocument(fileUri);
        }
        else {
            document = editor.document;
        }
        // Result
        return document.uri;
    });
}
exports.GetFileUriAsync = GetFileUriAsync;
function GetDocumentAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate
        if (IsRunFromExplorer(fileUri)) {
            // Make sure document exists
            let result = yield FileExistsAsync(fileUri.fsPath);
            if (result)
                return yield vscode.workspace.openTextDocument(fileUri);
            // Not found
            vscode.window.showInformationMessage("Error: File cannot be found");
        }
        // Try current document
        let editor = vscode.window.activeTextEditor;
        if (editor)
            return editor.document;
        return null;
    });
}
exports.GetDocumentAsync = GetDocumentAsync;
function IsRunFromExplorer(fileUri) {
    let editor = vscode.window.activeTextEditor;
    if (!fileUri || !fileUri.fsPath) {
        return false;
    }
    if (!editor) {
        return true;
    }
    if (fileUri.fsPath === editor.document.uri.fsPath) {
        return false;
    }
    return true;
}
exports.IsRunFromExplorer = IsRunFromExplorer;
function FileExistsAsync(path) {
    console.log('debugger:filesystem.FileExistsAsync');
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
exports.FileExistsAsync = FileExistsAsync;
function RenameFileAsync(oldName, newName) {
    console.log('debugger:filesystem.RenameFileAsync');
    return new Promise((resolve, reject) => {
        fs.rename(oldName, newName, err => {
            resolve(!err);
        });
    });
}
exports.RenameFileAsync = RenameFileAsync;
function GetFileStatsAsync(path) {
    console.log('debugger:filesystem.GetFileStatsAsync');
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (!err)
                return resolve(stats);
            resolve(undefined);
        });
    });
}
exports.GetFileStatsAsync = GetFileStatsAsync;
function RemoveFileAsync(path) {
    console.log('debugger:filesystem.RemoveFileAsync');
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            resolve(!err);
        });
    });
}
exports.RemoveFileAsync = RemoveFileAsync;
function FolderExistsAsync(folder) {
    console.log('debugger:filesystem.FolderExistsAsync');
    return new Promise((resolve, reject) => {
        fs.access(folder, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
exports.FolderExistsAsync = FolderExistsAsync;
function MkDirAsync(folder) {
    console.log('debugger:filesystem.MkDirAsync');
    return new Promise((resolve, reject) => {
        fs.mkdir(folder, err => {
            if (err && err.code == 'EEXIST')
                return resolve(true);
            resolve(!err);
        });
    });
}
exports.MkDirAsync = MkDirAsync;
function ChModAsync(path, mode = '777') {
    console.log('debugger:filesystem.ChModAsync');
    return new Promise((resolve, reject) => {
        fs.chmod(path, mode, err => {
            if (err) {
                application.Notify(`- failed to set chmod permissions: ${err.message}`);
            }
            resolve(!err);
        });
    });
}
exports.ChModAsync = ChModAsync;
function ReadFileAsync(path) {
    console.log('debugger:filesystem.ReadFileAsync');
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (!err)
                return resolve(data);
            resolve(undefined);
        });
    });
}
exports.ReadFileAsync = ReadFileAsync;
function WriteFileAsync(path, data) {
    console.log('debugger:filesystem.WriteFileAsync');
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            resolve(!err);
        });
    });
}
exports.WriteFileAsync = WriteFileAsync;
function WorkspaceFolder() {
    // Workspace 
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return "";
}
exports.WorkspaceFolder = WorkspaceFolder;
//# sourceMappingURL=filesystem.js.map
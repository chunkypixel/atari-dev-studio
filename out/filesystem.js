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
const fs = require("fs");
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
            if (FileExists(fileUri.fsPath))
                return yield vscode.workspace.openTextDocument(fileUri);
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
function FileExists(path) {
    console.log('debugger:filesystem.FileExists');
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
exports.FileExists = FileExists;
function RenameFile(oldName, newName) {
    console.log('debugger:filesystem.RenameFile');
    return new Promise((resolve, reject) => {
        fs.rename(oldName, newName, err => {
            resolve(!err);
        });
    });
}
exports.RenameFile = RenameFile;
function GetFileStats(path) {
    console.log('debugger:filesystem.GetFileStats');
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (!err)
                return resolve(stats);
            resolve(undefined);
        });
    });
}
exports.GetFileStats = GetFileStats;
function RemoveFile(path) {
    console.log('debugger:filesystem.RemoveFile');
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            resolve(!err);
        });
    });
}
exports.RemoveFile = RemoveFile;
function FolderExists(folder) {
    console.log('debugger:filesystem.FolderExists');
    return new Promise((resolve, reject) => {
        fs.access(folder, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
exports.FolderExists = FolderExists;
function MakeDir(folder) {
    console.log('debugger:filesystem.MakeDir');
    return new Promise((resolve, reject) => {
        fs.mkdir(folder, err => {
            resolve(!err);
        });
    });
}
exports.MakeDir = MakeDir;
function SetChMod(path, mode = '777') {
    console.log('debugger:filesystem.SetChMod');
    return new Promise((resolve, reject) => {
        fs.chmod(path, mode, err => {
            if (err) {
                console.log(`- failed to set chmod permissions: ${err.message}`);
            }
            resolve(!err);
        });
    });
}
exports.SetChMod = SetChMod;
//# sourceMappingURL=filesystem.js.map
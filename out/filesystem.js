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
function GetFileUri(fileUri) {
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
exports.GetFileUri = GetFileUri;
function FileExists(path) {
    console.log('debugger:filesystem.FileExists');
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
exports.FileExists = FileExists;
function FolderExists(folder) {
    console.log('debugger:filesystem.FolderExists');
    return new Promise((resolve, reject) => {
        fs.access(folder, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
exports.FolderExists = FolderExists;
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
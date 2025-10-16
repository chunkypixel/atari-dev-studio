"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExistsAsync = FileExistsAsync;
exports.RenameFileAsync = RenameFileAsync;
exports.GetFileStatsAsync = GetFileStatsAsync;
exports.RemoveFileAsync = RemoveFileAsync;
exports.FolderExistsAsync = FolderExistsAsync;
exports.MkDirAsync = MkDirAsync;
exports.ChModAsync = ChModAsync;
exports.ReadFileAsync = ReadFileAsync;
exports.WriteFileAsync = WriteFileAsync;
exports.WorkspaceFolder = WorkspaceFolder;
exports.GetFileExtension = GetFileExtension;
const vscode = require("vscode");
const application = require("./application");
const path = require("path");
const fs = require("fs");
function FileExistsAsync(path) {
    console.log('debugger:filesystem.FileExistsAsync PATH:' + path);
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
function RenameFileAsync(oldName, newName) {
    console.log('debugger:filesystem.RenameFileAsync');
    return new Promise((resolve, reject) => {
        fs.rename(oldName, newName, err => {
            resolve(!err);
        });
    });
}
function GetFileStatsAsync(path) {
    console.log('debugger:filesystem.GetFileStatsAsync');
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (!err) {
                return resolve(stats);
            }
            resolve(undefined);
        });
    });
}
function RemoveFileAsync(path) {
    console.log('debugger:filesystem.RemoveFileAsync');
    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            resolve(!err);
        });
    });
}
function FolderExistsAsync(folder) {
    console.log('debugger:filesystem.FolderExistsAsync FOLDER:' + folder);
    return new Promise((resolve, reject) => {
        fs.access(folder, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}
function MkDirAsync(folder) {
    console.log('debugger:filesystem.MkDirAsync FOLDER:' + folder);
    return new Promise((resolve, reject) => {
        fs.mkdir(folder, err => {
            if (err && err.code === 'EEXIST') {
                return resolve(true);
            }
            resolve(!err);
        });
    });
}
function ChModAsync(path, mode = '777') {
    console.log('debugger:filesystem.ChModAsync');
    return new Promise((resolve, reject) => {
        fs.chmod(path, mode, err => {
            if (err) {
                application.WriteToCompilerTerminal(`- failed to set chmod permissions: ${err.message}`);
            }
            resolve(!err);
        });
    });
}
function ReadFileAsync(path, encoding) {
    console.log('debugger:filesystem.ReadFileAsync');
    return new Promise((resolve, reject) => {
        fs.readFile(path, encoding, (err, data) => {
            if (!err) {
                return resolve(data);
            }
            resolve(undefined);
        });
    });
}
function WriteFileAsync(path, data) {
    console.log('debugger:filesystem.WriteFileAsync');
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            resolve(!err);
        });
    });
}
function WorkspaceFolder() {
    // Workspace 
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return "";
}
function GetFileExtension(uri) {
    return path.extname(uri.fsPath);
}
//# sourceMappingURL=filesystem.js.map
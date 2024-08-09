"use strict";
import * as vscode from 'vscode';
import * as application from './application';
import * as fs from 'fs';

export function FileExistsAsync(path: string): Promise<boolean> {
    console.log('debugger:filesystem.FileExistsAsync PATH:' + path);

    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}

export function RenameFileAsync(oldName: string, newName: string): Promise<boolean> {
    console.log('debugger:filesystem.RenameFileAsync');
    
    return new Promise((resolve, reject) => {
        fs.rename(oldName, newName, err => {
            resolve(!err);
        });
    }); 
}

export function GetFileStatsAsync(path: string): Promise<any> {
    console.log('debugger:filesystem.GetFileStatsAsync');
    
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (!err) { return resolve(stats); }
            resolve(undefined);
        });
    });     
}

export function RemoveFileAsync(path: string): Promise<boolean> {
    console.log('debugger:filesystem.RemoveFileAsync');

    return new Promise((resolve, reject) => {
        fs.unlink(path, err => {
            resolve(!err);
        });
    });
}

export function FolderExistsAsync(folder: string): Promise<boolean> {
    console.log('debugger:filesystem.FolderExistsAsync FOLDER:' + folder);

    return new Promise((resolve, reject) => {
        fs.access(folder, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });        
}

export function MkDirAsync(folder: string): Promise<boolean> {
    console.log('debugger:filesystem.MkDirAsync FOLDER:' + folder);
    
    return new Promise((resolve, reject) => {
        fs.mkdir(folder, err => {
            if (err && err.code === 'EEXIST') { return resolve(true); }
            resolve(!err);
        });
    }); 
}

export function ChModAsync(path: string, mode: string = '777'): Promise<boolean> {
    console.log('debugger:filesystem.ChModAsync');

    return new Promise((resolve, reject) => {
        fs.chmod(path, mode, err => {
            if (err) { application.WriteToCompilerTerminal(`- failed to set chmod permissions: ${err.message}`);}
            resolve(!err);
        });
    }); 
}

export function ReadFileAsync(path: string): Promise<any> {
    console.log('debugger:filesystem.ReadFileAsync');

    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (!err) { return resolve(data); }
            resolve(undefined);
        });
    });
}

export function WriteFileAsync(path: string, data: any): Promise<boolean> {
    console.log('debugger:filesystem.WriteFileAsync');

    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            resolve(!err);
        });
    });
}

export function WorkspaceFolder(): string {
    // Workspace 
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return "";
}

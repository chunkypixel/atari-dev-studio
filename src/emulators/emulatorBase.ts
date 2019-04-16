"use strict";
import * as path from 'path';
import * as vscode from 'vscode';
import * as application from '../application';
import * as filesystem from '../filesystem';

export abstract class EmulatorBase implements vscode.Disposable {

    // Features
    public readonly Id: string;
    public readonly Name: string;
    public CustomFolderOrPath: boolean = false;
    public readonly DefaultFolderOrPath: string;
    public FolderOrPath: string = "";
    public Args: string = "";

    constructor(id: string, name: string, folderOrPath: string) {
        this.Id = id;
        this.Name = name;
        this.DefaultFolderOrPath = folderOrPath;
    }

    public dispose(): void {
        console.log('debugger:EmulatorBase.dispose');
    }

}

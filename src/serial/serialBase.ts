"use strict";
import * as vscode from 'vscode';

export abstract class SerialBase {

    public readonly Id:string;
    public readonly Name: string;
    public FolderOrPath: string = "";
    protected FileName: string = "";  
    protected Configuration: vscode.WorkspaceConfiguration | undefined;

    constructor(id:string, name:string, folderOrPath: string) {
        this.Id = id;
        this.Name = name;
        this.FolderOrPath = folderOrPath;
    }

    public async SendGameAsync(fileName: string): Promise<boolean> {
        // Set
        this.FileName = fileName;

        // Process
        return await this.ExecuteSerialAsync();
    }

    protected abstract ExecuteSerialAsync(): Promise<boolean>;
    
    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:SerialBase.InitialiseAsync');

        // Configuration
        let result = await this.LoadConfigurationAsync();
        if (!result) { return false; }

        // Result
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:SerialBase.LoadConfigurationAsync');      
        // Result
        return true;
    }

}
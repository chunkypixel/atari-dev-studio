"use strict";
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
    protected File: string = "";  
    protected Configuration: vscode.WorkspaceConfiguration | undefined;

    constructor(id: string, name: string, folderOrPath: string) {
        this.Id = id;
        this.Name = name;
        this.DefaultFolderOrPath = folderOrPath;
    }

    public dispose(): void {
        console.log('debugger:EmulatorBase.dispose');
    }

    public async RunGameAsync(file: string): Promise<boolean> {
        // Set
        this.File = file;

        // Process
        let result = await this.InitialiseAsync();
        if (!result) return false;
        return await this.ExecuteEmulatorAsync();
    }

    protected abstract ExecuteEmulatorAsync(): Promise<boolean>
    
    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:EmulatorBase.InitialiseAsync');

        // Configuration
        let result = await this.LoadConfigurationAsync();
        if (!result) return false;

        // Result
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:EmulatorBase.LoadConfigurationAsync');      

        // Reset
        this.CustomFolderOrPath = false;
        this.FolderOrPath = this.DefaultFolderOrPath;
        this.Args = "";

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = vscode.workspace.getConfiguration(application.Name, null);

        // Emulator
        let userEmulatorPath = this.Configuration.get<string>(`${this.Id}.emulatorPath`)
        if (userEmulatorPath) {
            // Validate (user provided)
            let result = await filesystem.FileExistsAsync(userEmulatorPath);
            if (!result) {
                // Notify
                application.Notify(`ERROR: Cannot locate your chosen ${this.Name} emulator path '${userEmulatorPath}'`);
                return false;
            }

            // Set
            this.FolderOrPath = userEmulatorPath;
            this.CustomFolderOrPath = true;
        }
        // Emulator (Other)
        this.Args = this.Configuration.get<string>(`${this.Id}.emulatorArgs`,""); 

        // Result
        return true;
    }
}

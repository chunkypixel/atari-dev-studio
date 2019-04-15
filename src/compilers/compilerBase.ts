"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as application from '../application';
const cp = require("child_process");
const os = require("os");

export abstract class CompilerBase implements vscode.Disposable {

    // features
    public readonly IsRunning: boolean = false;
    public readonly CompilerName: string;
    public readonly CompilerExtensions: string[];
    public CustomCompilerFolder: boolean = false;
    public readonly DefaultCompilerFolder: string;
    public CompilerFolder: string = "";
    public CompilerArgs: string = "";
    public CompilerFormat: string = "";
    public CompilerVerboseness: string = "";
    readonly channelName: string = "compiler";
    readonly outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(this.channelName);
    readonly configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(application.ExtensionId, null);
    public Document: vscode.TextDocument | undefined;
    private WorkspaceFolder: string = "";
    
    constructor(compilerName: string, compilerExtensions: string[], compilerFolder: string) {
        this.CompilerName = compilerName;
        this.CompilerExtensions = compilerExtensions;
        this.DefaultCompilerFolder = compilerFolder;
    }

    public dispose(): void {
        console.log('debugger:CompilerBase.dispose');
    }

    public async BuildGameAsync(document: vscode.TextDocument): Promise<boolean> {
        // Set
        this.Document = document;

        // Process
        if (await !this.InitialiseAsync()) return false;
        return await this.ExecuteCompilerAsync();
    }

    public async BuildGameAndRunAsync(document: vscode.TextDocument): Promise<boolean> {
        // Process
        if (await !this.BuildGameAsync(document)) return false;
        // TODO: launch emulator here
        return true;
    }

    protected abstract ExecuteCompilerAsync(): Promise<boolean> 


    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.InitialiseConfigurationAsync');

        // Already running?
        if (this.IsRunning) {
            let message = `The compiler is already running! If you want to cancel the compilation activate the Stop/Kill command.`;
            vscode.window.showErrorMessage(message);
            console.log(`debugger:${message}`);
        }

        // Configuration
        if (!await this.LoadConfiguration()) return false;

        // Activate output window?
        if (!this.configuration.get<boolean>("editor.preserveCodeEditorFocus"))  {
            this.outputChannel.show();
        }

        // Clear output content?
        if (this.configuration.get<boolean>("editor.clearPreviousOutput"))  {
            this.outputChannel.clear();
        }

        // Save files?
        if (this.configuration.get<boolean>("editor.saveAllFilesBeforeRun"))  {
            vscode.workspace.saveAll();
        } else if (this.configuration.get<boolean>("editor.saveFileBeforeRun")) {
            if (this.Document) this.Document.save();
        }

         // Result
        return true;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        return true;
    }

    protected LoadConfiguration(): boolean {
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

    private getWorkspaceFolder(): string {
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
        if (this.Document) return path.dirname(this.Document.fileName);
        return "";
    }
}

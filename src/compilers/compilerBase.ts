"use strict";
import * as path from 'path';
import * as vscode from 'vscode';
import * as application from '../application';
import * as filesystem from '../filesystem';

export abstract class CompilerBase implements vscode.Disposable {

    // features
    public IsRunning: boolean = false;

    public readonly Id: string;
    public readonly Name: string;
    public readonly Extensions: string[];
    // Note: these need to be in reverse order compared to how they are read
    public readonly DebuggerExtensions: Map<string, string> = new Map([["-s",".sym"], ["-l",".lst"]]);;
    public CustomFolderOrPath: boolean = false;
    public readonly DefaultFolderOrPath: string;
    public FolderOrPath: string = "";
    public Args: string = "";
    public Format: string = "";
    public Verboseness: string = "";
    readonly channelName: string = "compiler";
    readonly outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(this.channelName);
    readonly configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(application.Id, null);
    public Document: vscode.TextDocument | undefined;

    public FileName: string = "";
    public CompiledFileName: string = "";
    public CompiledSubFolder: string = "";
    readonly CompiledExtensionName: string = ".bin";
    readonly CompiledSubFolderName: string = "bin";

    protected GenerateDebuggerFiles: boolean = false;
    protected CleanUpCompilationFiles: boolean = false;
    protected WorkspaceFolder: string = "";
    
    constructor(id: string, name: string, extensions: string[], folderOrPath: string) {
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
        this.DefaultFolderOrPath = folderOrPath;
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
            // Notify
            this.notify(`The ${this.Name} compiler is already running! If you want to cancel the compilation activate the Stop/Kill command.`);
            return false;
        }

        // Configuration
        if (!await this.LoadConfiguration()) return false;

        // Activate output window?
        if (!this.configuration.get<boolean>(`${application.Name}.editor.preserveCodeEditorFocus`))  {
            this.outputChannel.show();
        }

        // Clear output content?
        if (this.configuration.get<boolean>(`${application.Name}.editor.clearPreviousOutput`))  {
            this.outputChannel.clear();
        }

        // Save files?
        if (this.configuration.get<boolean>(`${application.Name}.editor.saveAllFilesBeforeRun`))  {
            vscode.workspace.saveAll();
        } else if (this.configuration.get<boolean>(`${application.Name}.editor.saveFileBeforeRun`)) {
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
        this.CustomFolderOrPath = false;
        this.FolderOrPath = this.DefaultFolderOrPath;
        this.Args = "";
        this.Format = "";
        this.Verboseness = "";

        // Compiler
        let userCompilerFolder = this.configuration.get<string>(`${application.Name}.${this.Id}.compilerFolder`);
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                // Notify
                this.notify(`ERROR: Cannot locate your chosen ${this.Name} compiler folder '${userCompilerFolder}'`);
                return false;
            }

            // Set
            this.FolderOrPath = userCompilerFolder;
            this.CustomFolderOrPath = true;
        }
        // Compiler (other)
        this.Args = this.configuration.get<string>(`${application.Name}.${this.Id}.compilerArgs`,"");
        this.Format = this.configuration.get<string>(`${application.Name}.${this.Id}.compilerFormat`,"");
        this.Verboseness = this.configuration.get<string>(`${application.Name}.${this.Id}.compilerVerboseness`,"");
    
        // Compilation
        this.GenerateDebuggerFiles = this.configuration.get<boolean>(`${application.Name}.compilation.generateDebuggerFiles`, true);
        this.CleanUpCompilationFiles = this.configuration.get<boolean>(`${application.Name}.compilation.cleanupCompilationFiles`, true);

        // System
        this.WorkspaceFolder = this.getWorkspaceFolder();
        this.FileName = path.basename(this.Document!.fileName);
        this.CompiledFileName = `${this.FileName}${this.CompiledExtensionName}`;
        this.CompiledSubFolder = path.join(this.WorkspaceFolder, this.CompiledSubFolderName);

        // Result
        return true;
    }

    protected async VerifyCompiledFileSizeAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.VerifyCompiledFileSize');

        // Prepare
        let compiledFilePath = path.join(this.WorkspaceFolder, this.CompiledFileName);

        // Process
        let stats = await filesystem.GetFileStats(compiledFilePath);
        if (stats) {
            // Validate
            if (stats.size > 0) { return true; }

            // Notify
            this.notify(`ERROR: Failed to create compiled file '${this.CompiledFileName}'. The file size is 0 bytes...`);      
        }

        // Failed
        return false;
    }

    protected async MoveFilesToBinFolderAsync(): Promise<boolean> {
        // Note: generateDebuggerFile - there are different settings for each compiler
        console.log('debugger:CompilerBase.MoveFilesToBinFolder');

        // Create directory?
        if (await !filesystem.MakeDir(this.CompiledSubFolder)) {
            // Notify
            this.notify(`ERROR: Failed to create folder '${this.CompiledSubFolderName}'`);
            return false;         
        }

        // Prepare
        let oldPath = path.join(this.WorkspaceFolder, this.CompiledFileName);
        let newPath = path.join(this.CompiledSubFolder, this.CompiledFileName);

        // Move compiled file
        if (await !filesystem.RenameFile(oldPath, newPath)) {
            // Notify
            this.notify(`ERROR: Failed to move file from '${this.CompiledFileName}' to ${this.CompiledSubFolderName} folder`);
            return false;            
        }

        // Notify
        this.notify(`Moved compiled file '${this.CompiledFileName}' to ${this.CompiledSubFolderName} folder...`);

        // Move all debugger files?
        if (this.GenerateDebuggerFiles)  {
            var debuggerFile: string = "";

            // Process
            this.DebuggerExtensions.forEach(async (extension: string, arg: string) => {
                // Prepare
                debuggerFile = `${this.FileName}${extension}`;
                let oldPath = path.join(this.WorkspaceFolder, debuggerFile);
                let newPath = path.join(this.CompiledSubFolder, debuggerFile);

                // Move compiled file
                if (await !filesystem.RenameFile(oldPath, newPath)) {
                    // Notify            
                    let message = `ERROR: Failed to move file '${debuggerFile}' to ${this.CompiledSubFolderName} folder`;
                    this.outputChannel.appendLine(message);
                    console.log(`debugger:${message}`);                
                };

                // Notify
                this.notify(`Moved debugger files to ${this.CompiledSubFolderName} folder...`);
            });
        }
        
        // Return
        return true;
    }

    protected async RemoveCompilationFilesAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.RemoveCompilationFilesAsync');

        // Override to language specific items
        // Make sure to callback here for the debugger stuff

        // Debugger files
        var debuggerFile: string = "";

        // Process
        this.DebuggerExtensions.forEach(async (extension: string, arg: string) => {
            // Prepare
            debuggerFile = `${this.FileName}${extension}`;
            let debuggerFilePath = path.join(this.WorkspaceFolder, debuggerFile);

            // Process
            await filesystem.RemoveFile(debuggerFilePath);
        }); 

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

    protected notify(message: string): void {
        this.outputChannel.appendLine(message);
        console.log(`debugger:${message}`);        
    }
}

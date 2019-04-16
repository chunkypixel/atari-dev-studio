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
    protected DefaultFolderOrPath: string;
    public FolderOrPath: string = "";
    public Args: string = "";
    public Format: string = "";
    public Verboseness: string = "";
    public Emulator: string = "";
    protected DefaultEmulator: string;
    protected Configuration: vscode.WorkspaceConfiguration | undefined;
    public Document: vscode.TextDocument | undefined;

    public FileName: string = "";
    public CompiledFileName: string = "";
    public CompiledSubFolder: string = "";
    readonly CompiledExtensionName: string = ".bin";
    readonly CompiledSubFolderName: string = "bin";

    protected GenerateDebuggerFiles: boolean = false;
    protected CleanUpCompilationFiles: boolean = false;
    protected WorkspaceFolder: string = "";
    
    constructor(id: string, name: string, extensions: string[], folderOrPath: string, emulator: string) {
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
        this.DefaultFolderOrPath = folderOrPath;
        this.DefaultEmulator = emulator;
    }

    public dispose(): void {
        console.log('debugger:CompilerBase.dispose');
    }

    public async BuildGameAsync(document: vscode.TextDocument): Promise<boolean> {
        // Set
        this.Document = document;

        // Process
        let result = await this.InitialiseAsync();
        if (!result) return false;
        return await this.ExecuteCompilerAsync();
    }

    public async BuildGameAndRunAsync(document: vscode.TextDocument): Promise<boolean> {
        // Process
        let result = await this.BuildGameAsync(document);
        if (!result) return false;

        // Get emulator
        for (const emulator of application.Emulators) {
            if (emulator.Id === this.Emulator) {
                return await emulator.RunGameAsync(path.join(this.CompiledSubFolder,this.CompiledFileName));
            }
        }

        // Not found
        application.Notify(`Unable to find emulator '${this.Emulator}' to launch game.`);
        return false;

        // Result
        return true;
    }

    protected abstract ExecuteCompilerAsync(): Promise<boolean> 

    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.InitialiseAsync');

        // Already running?
        if (this.IsRunning) {
            // Notify
            application.Notify(`The ${this.Name} compiler is already running! If you want to cancel the compilation activate the Stop/Kill command.`);
            return false;
        }

        // Configuration
        let result = await this.LoadConfigurationAsync();
        if (!result) return false;

        // Activate output window?
        if (!this.Configuration!.get<boolean>(`editor.preserveCodeEditorFocus`))  {
            application.CompilerOutputChannel.show();
        }

        // Clear output content?
        if (this.Configuration!.get<boolean>(`editor.clearPreviousOutput`))  {
            application.CompilerOutputChannel.clear();
        }

        // Save files?
        if (this.Configuration!.get<boolean>(`editor.saveAllFilesBeforeRun`))  {
            vscode.workspace.saveAll();
        } else if (this.Configuration!.get<boolean>(`editor.saveFileBeforeRun`)) {
            if (this.Document) this.Document.save();
        }

        // Remove old debugger file before build
        await this.RemoveDebuggerFilesAsync(this.CompiledSubFolder);

         // Result
        return true;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.LoadConfigurationAsync');  

        // Reset
        this.CustomFolderOrPath = false;
        this.FolderOrPath = this.DefaultFolderOrPath;
        this.Args = "";
        this.Format = "";
        this.Verboseness = "";
        this.Emulator = this.DefaultEmulator;

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = vscode.workspace.getConfiguration(application.Name, null);

        // Compiler
        let userCompilerFolder = this.Configuration.get<string>(`${this.Id}.compilerFolder`);
        if (userCompilerFolder) {
            // Validate (user provided)
            let result = await filesystem.FolderExistsAsync(userCompilerFolder);
            if (!result) {
                // Notify
                application.Notify(`ERROR: Cannot locate your chosen ${this.Name} compiler folder '${userCompilerFolder}'`);
                return false;
            }

            // Set
            this.FolderOrPath = userCompilerFolder;
            this.CustomFolderOrPath = true;
        }
        // Compiler (other)
        this.Args = this.Configuration.get<string>(`${this.Id}.compilerArgs`,"");
        this.Format = this.Configuration.get<string>(`${this.Id}.compilerFormat`,"3");
        this.Verboseness = this.Configuration.get<string>(`${this.Id}.compilerVerboseness`,"0");
    
        // Compilation
        this.GenerateDebuggerFiles = this.Configuration.get<boolean>(`compilation.generateDebuggerFiles`, true);
        this.CleanUpCompilationFiles = this.Configuration.get<boolean>(`compilation.cleanupCompilationFiles`, true);

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
        let fileStats = await filesystem.GetFileStatsAsync(compiledFilePath);
        if (fileStats) {
            // Validate
            if (fileStats.size > 0) { return true; }

            // Notify
            application.Notify(`ERROR: Failed to create compiled file '${this.CompiledFileName}'. The file size is 0 bytes...`);      
        }

        // Failed
        application.Notify(`ERROR: Failed to create compiled file '${this.CompiledFileName}'.`);     
        return false;
    }

    protected async MoveFilesToBinFolderAsync(): Promise<boolean> {
        // Note: generateDebuggerFile - there are different settings for each compiler
        console.log('debugger:CompilerBase.MoveFilesToBinFolder');

        // Create directory?
        let result = await filesystem.MkDirAsync(this.CompiledSubFolder);
        if (!result) {
            // Notify
            application.Notify(`ERROR: Failed to create folder '${this.CompiledSubFolderName}'`);
            return false;         
        }

        // Notify
        application.Notify(`Moving compiled file '${this.CompiledFileName}' to '${this.CompiledSubFolderName}' folder...`);

        // Prepare
        let oldPath = path.join(this.WorkspaceFolder, this.CompiledFileName);
        let newPath = path.join(this.CompiledSubFolder, this.CompiledFileName);

        // Move compiled file
        result = await filesystem.RenameFileAsync(oldPath, newPath);
        if (!result) {
            // Notify
            application.Notify(`ERROR: Failed to move file from '${this.CompiledFileName}' to ${this.CompiledSubFolderName} folder`);
            return false;            
        }

        // Move all debugger files?
        if (this.GenerateDebuggerFiles)  {          
            // Notify
            application.Notify(`Moving debugger files to '${this.CompiledSubFolderName}' folder...`);

            // Process
            this.DebuggerExtensions.forEach(async (extension: string, arg: string) => {
                // Prepare
                let debuggerFile: string = `${this.FileName}${extension}`;
                let oldPath = path.join(this.WorkspaceFolder, debuggerFile);
                let newPath = path.join(this.CompiledSubFolder, debuggerFile);

                // Move compiled file
                result = await filesystem.RenameFileAsync(oldPath, newPath);
                if (!result) {
                    // Notify            
                    application.Notify(`ERROR: Failed to move file '${debuggerFile}' to '${this.CompiledSubFolderName}' folder`);          
                };
            });
        }
        
        // Return
        return true;
    }

    protected async RemoveDebuggerFilesAsync(folder: string): Promise<boolean> {
        console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');

        // Process
        this.DebuggerExtensions.forEach(async (extension: string, arg: string) => {
            // Prepare
            let debuggerFile: string = `${this.FileName}${extension}`;
            let debuggerFilePath = path.join(folder, debuggerFile);

            // Process
            await filesystem.RemoveFileAsync(debuggerFilePath);
        }); 

        // Result
        return true;
    }

    private getWorkspaceFolder(): string {
        console.log('debugger:CompilerBase.getWorkspaceFolder');

        // Issue: Get actual document first as the workspace
        //        is not the best option when file is in a subfolder
        //        of the chosen workspace

        // Document
        if (this.Document) return path.dirname(this.Document.fileName);

        // Workspace (last resort)
        if (vscode.workspace.workspaceFolders) {
            if (this.Document) {
                let workspaceFolder = vscode.workspace.getWorkspaceFolder(this.Document!.uri);
                if (workspaceFolder) {
                    return workspaceFolder.uri.fsPath;
                }
            }
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return "";
    }
}

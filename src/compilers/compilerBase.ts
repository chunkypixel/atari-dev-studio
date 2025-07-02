"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';

export abstract class CompilerBase implements vscode.Disposable {

    // Features
    public IsRunning: boolean = false;

    public readonly Id: string;
    public readonly Name: string;
    public readonly Extensions: string[];
    public readonly CompiledExtensions: string[];
    public readonly VerifyCompiledExtensions: string[];
    // Note: these need to be in reverse order compared to how they are read
    public DebuggerExtensions: Map<string, string> = new Map([["-s",".sym"], ["-l",".lst"]]);
    public CustomFolderOrPath: boolean = false;
    protected DefaultFolderOrPath: string;
    public FolderOrPath: string = "";
    public Args: string = "";
    public Emulator: string = "";
    protected DefaultEmulator: string;
    protected Configuration: vscode.WorkspaceConfiguration | undefined;
    public Document: vscode.TextDocument | undefined;

    public CompilerVersion: number = 0.0;
    public FileName: string = "";
    public CompiledSubFolder: string = "";
    readonly CompiledSubFolderName: string = "bin";
    
    protected GenerateDebuggerFiles: boolean = true;
    protected CleanUpCompilationFiles: boolean = true;
    protected StripSourceFileExtensions: boolean = true;
    protected WorkspaceFolder: string = "";

    protected UsingMakeFileCompiler: boolean = false;
    protected UsingBatchCompiler: boolean = false;
    protected UsingShellScriptCompiler: boolean = false;

    protected LaunchEmulatorOrCartOption: string = "";
    protected LaunchEmulatorOrCartOptionAvailable: boolean = false;

    constructor(id: string, name: string, extensions: string[], compiledExtensions: string[], verifyCompiledExtensions: string[], folderOrPath: string, emulator: string) {
        this.Id = id;
        this.Name = name;
        this.Extensions = extensions;
        this.CompiledExtensions = compiledExtensions;
        // if no verified compiled extensions then use default
        this.VerifyCompiledExtensions = verifyCompiledExtensions;
        if (!verifyCompiledExtensions) this.VerifyCompiledExtensions = compiledExtensions;
        this.DefaultFolderOrPath = folderOrPath;
        this.DefaultEmulator = emulator;
    }

    public dispose(): void {
        console.log('debugger:CompilerBase.dispose');
    }

    public async BuildGameAsync(document: vscode.TextDocument): Promise<boolean> {
        // Set
        this.Document = document;

        // Initialise
        let result = await this.InitialiseAsync();
        if (!result) { return false; }

        // Execute
        return await this.ExecuteCompilerAsync();
    }

    public async BuildGameAndRunAsync(document: vscode.TextDocument): Promise<boolean> {
        // Process
        let result = await this.BuildGameAsync(document);
        if (!result) { return false; }

        // Does compiler have/use an emulator?
        // Make doesn't use an emulator - user must provide their own
        if (this.Emulator === '' || (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler)) { return true; }

        // Use/Try serial (windows only)
        if (this.LaunchEmulatorOrCartOption != "Emulator") {
            // Validate
            if (!this.LaunchEmulatorOrCartOptionAvailable) {
                // NOT AVAILABLE FOR LANGUAGE - Advise
                application.WriteToCompilerTerminal(`Warning: Launching to 7800GD cart is not available for the ${this.Name} language - reverting to emulator...`);
            
            } else if (!application.IsWindows) {
                // WINDOWS ONLY - Advise
                application.WriteToCompilerTerminal(`Warning: Launching to 7800GD cart is currently only available for Windows - reverting to emulator...`);

            } else {
                // Find
                for await (let serial of application.Serials) {    
                    if (serial.Id === this.LaunchEmulatorOrCartOption) {
                        // Match
                        let compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                        return await serial.SendGameAsync(path.join(this.CompiledSubFolder,compiledFileName));
                    }
                }
            }
        }

        // Try emulator
        for await (let emulator of application.Emulators) {
            if (emulator.Id === this.Emulator) {
                // Note: first extension should be the one which is to be launched
                let compiledFileName = `${this.FileName}${this.CompiledExtensions[0]}`;
                return await emulator.RunGameAsync(path.join(this.CompiledSubFolder,compiledFileName));
            }
        }

        // Not found
        application.WriteToCompilerTerminal(`Unable to find emulator '${this.Emulator}' to launch game.`);
        return false;
    }

    protected abstract ExecuteCompilerAsync(): Promise<boolean>; 

    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.InitialiseAsync');

        // Prepare
        let result = true;

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = application.GetConfiguration();

        // Clear output content?
        // Note: need to do this here otherwise output from configuration is lost
        if (this.Configuration.get<boolean>(`editor.clearPreviousOutput`))  {
            application.CompilerOutputChannel.clear(); 
        }

        // Already running?
        if (this.IsRunning) {
            // Notify
            application.WriteToCompilerTerminal(`The ${this.Name} compiler is already running! If you need to cancel the compilation process use the 'ads: Kill build process' option from the Command Palette.`);
            return false;
        }

        // Configuration
        result = await this.LoadConfigurationAsync();
        if (!result) { return false; }
        
        // Launch emulator or cart
        this.LaunchEmulatorOrCartOption = this.Configuration.get<string>(`launch.emulatorOrCart`,"Emulator");

        // Activate output window?
        if (!this.Configuration.get<boolean>(`editor.preserveCodeEditorFocus`))  {
            if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
                application.AdsTerminal?.show();
            } else {
                application.CompilerOutputChannel.show();               
            }
        }

        // Save files (based on user configuration)
        result = await this.SaveAllFilesBeforeRun()
        if (!result) { return false; }

        // Remove old debugger files before build
        if (!this.UsingMakeFileCompiler && !this.UsingBatchCompiler && !this.UsingShellScriptCompiler) { 
            await this.RemoveDebuggerFilesAsync(this.CompiledSubFolder); 
        }

        // Read compiler version (if used)
        await this.GetCompilerVersionAsync();

        // Show any specific compiler warnings
        this.ShowAnyCompilerWarnings();

        // Result
        return true;
    }

    protected async SaveAllFilesBeforeRun(): Promise<boolean> {
        // Prepare
        let result = true;
        let repeatCounter = 0;

        // NOTE: turning off files.AutoSave may help in this area

        // There appears to be an issue using SaveAll in VSCODE in certain situations
        // I often see it when editing the Compare View and it been happening for a long time
        // Bloody annoying as you need to restart the compile process due to me checking the result
        // NOTE: if this doesn't fix it long term I'm going to remove the result validation
        do {
            if (this.Configuration?.get<boolean>(`editor.saveAllFilesBeforeRun`))  {
                result = await vscode.workspace.saveAll();
    
            } else if (this.Configuration?.get<boolean>(`editor.saveFileBeforeRun`)) {
                if (this.Document) { 
                    result = await this.Document.save(); 
                }
            }
            if (!result) { 
                // repeat up to 5 times
                repeatCounter = repeatCounter+1
                console.log(`debugger:CompilerBase.SaveFileBeforeRun.RepeatCounter=${repeatCounter}`);
                if (repeatCounter > 4) {
                    let message = "WARNING: It appears one or more of your unsaved documents did not save as expected.";
                    application.WriteToCompilerTerminal(message);
                    console.log(`debugger:CompilerBase.SaveFileBeforeRun ${message}`);
                    return false;             
                } 
                // put in a little delay
                await application.Delay(250);
            } 
        } while (!result)

        // return
        return true;
    }

    protected async VerifyCompilerFilesExistsAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.VerifyCompilerFilesExistsAsync');

        // Prepare
        let compilerFileList:string[] = this.GetCompilerFileList();
        let result = true;

        // Process
        application.WriteToCompilerTerminal(`Verifying compiler files exist...`);
        for (let compilerFileName of compilerFileList) {
            // Prepare
            let compilerFilePath = path.join(this.FolderOrPath, compilerFileName);

            // Validate
            if (!await filesystem.FileExistsAsync(compilerFilePath)) {
                // Not found
                application.WriteToCompilerTerminal(`ERROR: Unable to locate compiler file '${compilerFileName}'. `);  
                result = false; 
            }
        }

        // Failed?, 
        if (!result) {
            let message = "NOTE: your anti-virus software may have quarantined one or more files related to the compiler due to a false/positive test and where this is the case please ensure you whitelist to allow these files to used.  Alternatively try re-installing the extension.";
            application.WriteToCompilerTerminal(message);  
        }

        // Result
        return result;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) { return true; }

        // Prepare
        let compilerFileList:string[] = this.GetCompilerFileList();
        let result = true;

        // Process
        application.WriteToCompilerTerminal(`Verifying file permissions...`);
        for (let compilerFileName of compilerFileList) {
            // Prepare
            let compilerFilePath = path.join(this.FolderOrPath, compilerFileName);

            // Validate
            if (!await filesystem.ChModAsync(compilerFilePath)) {
                // Not found
                application.WriteToCompilerTerminal(`WARNING: Unable to set file permissions for compiler file '${compilerFileName}'. `);  
                result = false; 
            }
        }
     
        // Result
        return result;
    }

    protected async GetCompilerVersionAsync(): Promise<void> { 
    }

    protected GetCompilerFileList(): string[] {
        return [];
    } 

    protected ShowAnyCompilerWarnings(): void {
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.LoadConfigurationAsync');  

        // Reset
        this.CustomFolderOrPath = false;
        this.FolderOrPath = this.DefaultFolderOrPath;
        this.Args = "";
        this.Emulator = this.DefaultEmulator;
        this.UsingMakeFileCompiler = false;
        this.UsingBatchCompiler = false;
        this.UsingShellScriptCompiler = false;

        // System
        this.WorkspaceFolder = this.GetWorkspaceFolder();
        this.FileName = path.basename(this.Document!.fileName);

        // Validate compilers
        console.log('debugger:CompilerBase.LoadConfigurationAsync.ValidateCompiler');  
        let defaultCompiler = this.Configuration!.get<string>(`compiler.${this.Id}.defaultCompiler`);
        if (defaultCompiler === "Make") {
            // Only working in dasm currently

            // validate for one of the script files
            if (!await this.ValidateTerminalMakeFileAvailableAysnc())  { return false; }

            // Initialise terminal
            await application.InitialiseAdsTerminalAsync();
            return true;
        }
        if (defaultCompiler === "Custom") {
            // Validate
            // bB and 7800basic check for a folder, dasm checks for a path
            await this.ValidateCustomCompilerLocationAsync();
        } 

        // Compiler (other)
        this.Args = this.Configuration!.get<string>(`compiler.${this.Id}.args`,"");

        // Compilation
        this.GenerateDebuggerFiles = this.Configuration!.get<boolean>(`compiler.options.generateDebuggerFiles`, true);
        this.CleanUpCompilationFiles = this.Configuration!.get<boolean>(`compiler.options.cleanupCompilationFiles`, true);
        this.StripSourceFileExtensions = this.Configuration!.get<boolean>(`compiler.options.stripSourceFileExtensions`, true);

        // System
        this.CompiledSubFolder = path.join(this.WorkspaceFolder, this.CompiledSubFolderName);

        // Result
        return true;
    }

    protected async ValidateTerminalMakeFileAvailableAysnc(): Promise<boolean> {
        console.log('debugger:CompilerBase.ValidateTerminalMakeFileAvailableAysnc'); 

        // Makefile?
        this.UsingMakeFileCompiler = await this.FindTerminalMakeFileAsync("makefile");
        if (!this.UsingMakeFileCompiler) { this.UsingMakeFileCompiler = await this.FindTerminalMakeFileAsync("Makefile"); }
        if (!this.UsingMakeFileCompiler) { this.UsingMakeFileCompiler = await this.FindTerminalMakeFileAsync("MAKEFILE"); }
        if (this.UsingMakeFileCompiler) { return true; }
    
        // Shell?
        this.UsingShellScriptCompiler = await this.FindTerminalMakeFileAsync("makefile.sh"); 
        if (!this.UsingShellScriptCompiler) { this.UsingShellScriptCompiler = await this.FindTerminalMakeFileAsync("Makefile.sh"); }
        if (!this.UsingShellScriptCompiler) { this.UsingShellScriptCompiler = await this.FindTerminalMakeFileAsync("MAKEFILE.SH"); }
        if (this.UsingShellScriptCompiler) { return true; }    

        // Bat?
        this.UsingBatchCompiler = await this.FindTerminalMakeFileAsync("makefile.bat");
        if (this.UsingBatchCompiler) { return true; }

        // Nothing found
        let message = `ERROR: You have chosen to use the Make compiler for ${this.Id} but no makefile was not found in your root workspace folder.\nCreate a 'Makefile', 'makefile.bat' or 'makefile.sh' script...`;
        application.WriteToCompilerTerminal(message);
        application.ShowErrorPopup(message);

        // Exit
        return false;
    }

    protected async ValidateCustomCompilerLocationAsync() : Promise<void> {
        console.log('debugger:CompilerBase.ValidateCustomCompilerLocationAsync');  

        // Validate for a folder
        let customCompilerFolder = this.Configuration!.get<string>(`compiler.${this.Id}.folder`);
        if (!customCompilerFolder) {
            // No custom compiler provided, revert
            let message = `WARNING: You have chosen to use a custom ${this.Name} compiler but have not provided the location.\nReverting to the default compiler...`;
            application.WriteToCompilerTerminal(message);
            application.ShowWarningPopup(message);

        } else {
            // Validate custom compiler path exists
            let result = await filesystem.FolderExistsAsync(customCompilerFolder);
            if (!result) {
                // Failed, revert
                let message = `WARNING: Your custom ${this.Name} compiler location '${customCompilerFolder}' cannot be found.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                application.ShowWarningPopup(message);

            } else {
                // Ok
                application.WriteToCompilerTerminal(`Building using your custom ${this.Name} compiler.`);               
                application.WriteToCompilerTerminal(`Location: ${customCompilerFolder}`);  

                // Set
                this.FolderOrPath = customCompilerFolder;
                this.CustomFolderOrPath = true;
            }
        }

        // Finalise
        application.WriteToCompilerTerminal("");
    }

    protected async VerifyCompiledFileSizeAsync(): Promise<boolean> {
        console.log('debugger:CompilerBase.VerifyCompiledFileSize');

        // Validate
        if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) { return true; }

        // Verify created file(s)
        application.WriteToCompilerTerminal(`Verifying compiled file(s)...`);
        for await (let extension of this.VerifyCompiledExtensions) {
            // Prepare
            let compiledFileName = `${this.FileName}${extension}`;
            let compiledFilePath = path.join(this.WorkspaceFolder, compiledFileName);

            // Validate
            let fileStats = await filesystem.GetFileStatsAsync(compiledFilePath);
            if (fileStats && fileStats.size > 0) { continue; }

            // Failed
            application.WriteToCompilerTerminal(`ERROR: Failed to create compiled file '${compiledFileName}'.`);     
            return false;  
        }

        // Result
        return true;
    }

    protected async MoveFilesToBinFolderAsync(): Promise<boolean> {
        // Note: generateDebuggerFile - there are different settings for each compiler
        console.log('debugger:CompilerBase.MoveFilesToBinFolder');

        // Validate
        if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) { return true; }

        // Create directory?
        let result = await filesystem.MkDirAsync(this.CompiledSubFolder);
        if (!result) {
            // Notify
            application.WriteToCompilerTerminal(`ERROR: Failed to create folder '${this.CompiledSubFolderName}'`);
            return false;         
        }

        // Move compiled file(s)
        application.WriteToCompilerTerminal(`Moving compiled file(s) to '${this.CompiledSubFolderName}' folder...`);
        for await (let extension of this.CompiledExtensions) {
            // Prepare
            let compiledFileName = `${this.FileName}${extension}`;

            // leading minus (-)? if so strip any existing extensions from filename before adding
            // There is a sepcific requirement for the 7800basic compiler
            if (extension.startsWith("-")) {
                // remove minus (-)
                extension = extension.slice(1);
                compiledFileName = `${path.parse(this.FileName).name}${extension}`;
            }

            // set old path
            let oldPath = path.join(this.WorkspaceFolder, compiledFileName);

            // set new path
            if (this.StripSourceFileExtensions) {
                // remove source file extensions for new path filename
                compiledFileName = `${path.parse(this.FileName).name}${extension}`;
            }
            let newPath = path.join(this.CompiledSubFolder, compiledFileName);

            // Move compiled file
            // Updated to check as we may now have optional files (7800basic - .CC2, bB - .ace)
            if (await filesystem.FileExistsAsync(oldPath)) {
                // Process
                result = await filesystem.RenameFileAsync(oldPath, newPath);
                if (!result) {
                    // Notify
                    application.WriteToCompilerTerminal(`ERROR: Failed to move file from '${compiledFileName}' to ${this.CompiledSubFolderName} folder`);
                    return false;            
                }
            }
        }

        // Process?
        if (this.GenerateDebuggerFiles)  {          
            // Move all debugger files?
            application.WriteToCompilerTerminal(`Moving debugger file(s) to '${this.CompiledSubFolderName}' folder...`);
            for await (let [arg, extension] of this.DebuggerExtensions) {
                // Prepare
                let debuggerFileName: string = `${this.FileName}${extension}`;

                // Set old path
                let oldPath = path.join(this.WorkspaceFolder, debuggerFileName);

                // Set new path
                if (this.StripSourceFileExtensions) {
                    // remove source file extensions for new path filename
                    debuggerFileName = `${path.parse(this.FileName).name}${extension}`;
                }
                let newPath = path.join(this.CompiledSubFolder, debuggerFileName);

                // Move compiled file?
                if (await filesystem.FileExistsAsync(oldPath)) {
                    result = await filesystem.RenameFileAsync(oldPath, newPath);
                    if (!result) {
                        // Notify            
                        application.WriteToCompilerTerminal(`ERROR: Failed to move file '${debuggerFileName}' to '${this.CompiledSubFolderName}' folder`);          
                    }
                }
            }
        }
        
        // Return
        return true;
    }

    protected async RemoveDebuggerFilesAsync(folder: string): Promise<boolean> {
        console.log('debugger:CompilerBase.RemoveDebuggerFilesAsync');

        // Process
        for await (let [arg, extension] of this.DebuggerExtensions) {
            // Prepare
            let debuggerFile: string = `${this.FileName}${extension}`;
            let debuggerFilePath = path.join(folder, debuggerFile);

            // Process
            if (await filesystem.FileExistsAsync(debuggerFilePath)) {
                await filesystem.RemoveFileAsync(debuggerFilePath);
            }
        }

        // Result
        return true;
    }

    public Kill() {
        console.log('debugger:CompilerBase.Kill');
        
        // Validate
        if (this.IsRunning) {
            // Notify
            application.WriteToCompilerTerminal(`Attempting to kill running ${this.Name} compilation process...`);

            // Process
            this.IsRunning = false;
            execute.KillSpawnProcess();
        }
    }

    private async FindTerminalMakeFileAsync(fileName: string): Promise<boolean> {
        // Scan for required makefile and store if found
        let result = await filesystem.FileExistsAsync(path.join(this.WorkspaceFolder,fileName));
        if (result) { this.FileName = fileName; }

        // Return
        return result;
    }

    private GetWorkspaceFolder(): string {
        console.log('debugger:CompilerBase.getWorkspaceFolder');

        // Issue: Get actual document first as the workspace
        //        is not the best option when file is in a subfolder
        //        of the chosen workspace

        // Document
        let uri = this.Document?.uri;
        if (this.Document) { return path.dirname(this.Document.fileName); }

        // Workspace (last resort)
        if (vscode.workspace.workspaceFolders && uri) {
                let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
                if (workspaceFolder) {
                    return workspaceFolder.uri.fsPath;
                }
                return vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        return "";
    }
}

"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { CompilerBase } from "./compilerBase";

export class DasmCompiler extends CompilerBase {

    // Features
    public Format: string = "";
    public Verboseness: string = "";

    constructor() {
        super("dasm",
                "dasm",
                [".dasm",".asm",".a",".h"],
                [".bin"],
                path.join(application.Path,"out","bin","compilers","dasm"),
                "Stella");           
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.ExecuteCompilerAsync');

        // Make compile?
        if (this.UsingMakeFileCompiler) {   
            // Launch and exit
            application.AdsTerminal?.sendText(`make`);
            return true;
        }
        // Bat or Shell compiler?
        if (this.UsingBatchCompiler || this.UsingShellScriptCompiler) {
             // Launch and exit
             application.AdsTerminal?.sendText(`${this.FileName}`);
             return true;           
        }

        // Standard compile
        // Premissions
        await this.RepairFilePermissionsAsync();

        // Compiler options
        let command = `"${this.FolderOrPath}"`;
        let args = [
            `"${this.FileName}"`,
            `-o${this.FileName}${this.CompiledExtensions[0]}`
        ];
        // Format
        if (this.Format) { args.push(`${"-f"}${this.Format}`); }
        // Verboseness
        if (this.Verboseness) { args.push(`${"-v"}${this.Verboseness}`); }
        // Args
        if (this.GenerateDebuggerFiles)  {
            // Process
            this.DebuggerExtensions.forEach((extension: string, arg: string) => {
                args.push(`${arg}${this.FileName}${extension}`);
            });
        }
        if (this.Args) { args.push(`${this.Args}`); }
        // Env
        let env : { [key: string]: string | null } = {};

        // Notify
        application.CompilerOutputChannel.appendLine(`Starting build of ${this.FileName}...`); 

        // Process
        this.IsRunning = true;
        let executeResult = await execute.Spawn(command, args, env, this.WorkspaceFolder,
            (stdout: string) => {
                // Prepare
                let result = true;

                // Validate
                if (stdout.includes("Parse error:") || stdout.includes("error:")) {
                    // Potential messages received (so far):
                    // Parse error
                    // Error: 
                    
                    // Failed
                    result = false;
                }

                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Validate
                if (stderr.includes("Permission denied")) {
                    // Potential messages received (so far):
                    // Permission denied
                    
                    // Failed
                    result = false;
                }
                                
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
        this.IsRunning = false;

        // Finalise
        if (executeResult) { executeResult = await this.VerifyCompiledFileSizeAsync(); }
        await this.RemoveCompilationFilesAsync(executeResult);
        if (executeResult) { executeResult = await this.MoveFilesToBinFolderAsync(); }
    
        // Result
        return executeResult;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.LoadConfigurationAsync');  

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) { return false; }

        // Using a make process? if so we can skip some of the configuration
        if (this.UsingMakeFileCompiler || this.UsingBatchCompiler || this.UsingShellScriptCompiler) { return true; }

        // Default compiler
        if (!this.CustomFolderOrPath) {
             // dasm name (depends on OS)
            let dasmName = "dasm.exe";
            if (application.IsLinux) {
                // Linux
                dasmName = "dasm";
            } else if (application.IsMacOS) {
                // MacOS
                dasmName = "dasm";
            }
            // Append path (based on architecture and emulator name)
            this.FolderOrPath = path.join(this.DefaultFolderOrPath,application.OSPlatform,application.OSArch,dasmName);                
        }

        // Compiler (other)
        this.Format = this.Configuration!.get<string>(`compiler.${this.Id}.format`,"3");
        this.Verboseness = this.Configuration!.get<string>(`compiler.${this.Id}.verboseness`,"0");

        // Emulator
        // User can select required emulator from settings
        let userDefaultEmulator = this.Configuration!.get<string>(`compiler.${this.Id}.defaultEmulator`);
        if (userDefaultEmulator) {
            this.Emulator = userDefaultEmulator;
        }

        // Result
        return true;
    }

    protected async ValidateCustomCompilerLocationAsync() : Promise<void> {
        console.log('debugger:DasmCompiler.ValidateCustomCompilerLocationAsync');  

        // Validate for a folder
        let customCompilerPath = this.Configuration!.get<string>(`compiler.${this.Id}.path`);
        if (!customCompilerPath) {
            // No custom compiler provided, revert
            let message = `WARNING: You have chosen to use a custom ${this.Name} compiler but have not provided the location.\nReverting to the default compiler...`;
            application.WriteToCompilerTerminal(message);
            application.ShowWarningPopup(message);

        } else {
            // Validate custom compiler path exists
            let result = await filesystem.FileExistsAsync(customCompilerPath);
            if (!result) {
                // Failed, revert
                let message = `WARNING: Your custom ${this.Name} compiler location '${customCompilerPath}' cannot be found.\nReverting to the default compiler...`;
                application.WriteToCompilerTerminal(message);
                application.ShowWarningPopup(message);

            } else {
                // Ok
                application.WriteToCompilerTerminal(`Building using your custom ${this.Name} compiler.`);               
                application.WriteToCompilerTerminal(`Location: ${customCompilerPath}`);  

                // Set
                this.FolderOrPath = customCompilerPath;
                this.CustomFolderOrPath = true;
            }
        }

        // Finalise
        application.WriteToCompilerTerminal("");
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) { return true; }

        // Github: https://github.com/chunkypixel/atari-dev-studio/issues/1
        //         Duplication of filename
        
        // Process
        let result = await filesystem.ChModAsync(this.FolderOrPath);
        return result;
    }

    protected async RemoveCompilationFilesAsync(result: boolean): Promise<boolean> {
        console.log('debugger:DasmCompiler.RemoveCompilationFiles');

        // Language specific files
        if (!result)  {
            // Process
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.bin`));
        }

        // Debugger files (from workspace not bin)
        if (!this.GenerateDebuggerFiles || this.CleanUpCompilationFiles) {
            await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
        }

        // Result
        return true;
    }

}
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

        // Prepare
        let result = true;

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Compiler options
        let command = this.FolderOrPath;
        let args = [
            this.FileName,
            `-o${this.FileName}${this.CompiledExtensions[0]}`
        ];
        // Format
        if (this.Format) args.push(`${"-f"}${this.Format}`);
        // Verboseness
        if (this.Verboseness) args.push(`${"-v"}${this.Verboseness}`);
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

        // Compile
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

        // Validate
        if (!executeResult) result = false;

        // Finalise
        if (result) result = await this.VerifyCompiledFileSizeAsync();
        if (result) result = await this.MoveFilesToBinFolderAsync();

        // Remove (if failed)
        await this.RemoveCompilationFilesAsync(result);

        // Result
        return result;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.LoadConfigurationAsync');  

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) return false;

        // Compiler
        // We use a path instead of a folder for dasm for added flexibility
        this.CustomFolderOrPath = false;
        let userCompilerPath = this.Configuration!.get<string>(`compiler.${this.Id}.path`);
        if (userCompilerPath) {
            // Validate (user provided)
            let result = await filesystem.FileExistsAsync(userCompilerPath);
            if (!result) {
                // Notify
                application.Notify(`ERROR: Cannot locate your chosen ${this.Name} compiler path '${userCompilerPath}'`);
                return false;
            }

            // Set
            this.FolderOrPath = userCompilerPath;
            this.CustomFolderOrPath = true;
        } else {
            // dasm command (depends on OS)
            let dasmCommand = "dasm.exe";
            if (application.IsLinux) {
                // Linux
                dasmCommand = "dasm.Linux.x86";
            } else if (application.IsMacOS) {
                // MacOS
                dasmCommand = "dasm.Darwin.x86";
            }
            // Use the default
            this.FolderOrPath = path.join(this.DefaultFolderOrPath, dasmCommand);                
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

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) return true;

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
        if (!this.GenerateDebuggerFiles || !result) {
            await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
        }

        // Result
        return true;
    }
}
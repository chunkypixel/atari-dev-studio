"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { CompilerBase } from "./compilerBase";

export class DasmCompiler extends CompilerBase {

    constructor() {
        super("dasm","dasm",[".dasm",".asm",".a",".h"],path.join(application.Path,"out","bin","dasm"));
            
    }
    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.ExecuteCompilerAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Compiler options
        let command = this.FolderOrPath;
        let args = [
            this.FileName,
            `-o${this.CompiledFileName}`
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

        // Process
        this.outputChannel.appendLine(`Building '${this.FileName}'...`); 

        // Compile
        this.IsRunning = true;
        let executeResult = await execute.Spawn(command, args, env, this.WorkspaceFolder,
            (stdout: string) => {
                // Prepare
                let result = true;

                // Result
                this.outputChannel.append('' + stdout);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Result
                this.outputChannel.append('' + stderr);
                return result;
            });
        this.IsRunning = false;

        // Validate
        if (!executeResult) return false;

        // Verify file size
        if (await !this.VerifyCompiledFileSizeAsync()) return false;

        // Move file(s) to Bin folder
        if (await !this.MoveFilesToBinFolderAsync()) return false;

        // Result
        return true;
    }

    protected LoadConfiguration(): boolean {
        console.log('debugger:DasmCompiler.LoadConfiguration');  

        // Base
        if (!super.LoadConfiguration()) return false;

        // Compiler
        // We use a path instead of a folder for dasm for added flexibility
        this.CustomFolderOrPath = false;
        let userCompilerPath = this.Configuration!.get<string>(`${this.Id}.compilerPath`);
        if (userCompilerPath) {
            // Validate (user provided)
            if (!filesystem.FileExists(userCompilerPath)) {
                // Notify
                this.notify(`ERROR: Cannot locate your chosen ${this.Name} compiler path '${userCompilerPath}'`);
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

        // Result
        return true;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.SetChMod(path.join(this.FolderOrPath,`dasm.${architecture}.x86`));
        return result;
    }

    // protected async RemoveCompilationFilesAsync(): Promise<boolean> {
    //     console.log('debugger:DasmCompiler.RemoveCompilationFiles');

    //     // Debugger files (from workspace not bin)
    //     await this.RemoveCompilationFilesAsync();

    //     // Notify
    //     this.notify(`Cleaned up files generated during compilation...`);

    //     // Result
    //     return true;
    // }
}
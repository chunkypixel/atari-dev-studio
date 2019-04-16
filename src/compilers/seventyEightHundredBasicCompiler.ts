"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { CompilerBase } from "./compilerBase";

export class SeventyEightHundredBasicCompiler extends CompilerBase {

    constructor() {
        super("7800basic","7800basic",[".bas",".78b"],path.join(application.Path,"out","bin","compilers","7800basic"));
    }
    
    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Compiler options
        let commandName = "7800bas.bat";
        if (application.IsLinux || application.IsMacOS) {
            // Linux or MacOS
            commandName = "./7800basic.sh";
        }
        
        // Compiler options
        let command = path.join(this.FolderOrPath, commandName);
        let args = [
            `"${this.FileName}"`,
            this.Args
        ];

        // Compiler environment
        let env : { [key: string]: string | null } = {};
        env["PATH"] = this.FolderOrPath;
        if (application.IsLinux || application.IsMacOS) {
            // Additional for Linux or MacOS
            env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
        }
        env["bB"] = this.FolderOrPath;

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

        // Clean up file(s) creating during compilation
        if (await !this.RemoveCompilationFilesAsync()) return false;

        // Move file(s) to Bin folder
        if (await !this.MoveFilesToBinFolderAsync()) return false;

        // Result
        return true;
    }

    // protected LoadConfiguration(): boolean {
    //     console.log('debugger:SeventyEightHundredBasicCompiler.LoadConfiguration');  

    //     // Base
    //     if (!super.LoadConfiguration()) return false;

    //     // Result
    //     return true;
    // }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.SetChMod(path.join(this.FolderOrPath,'7800basic.sh'));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`7800basic.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`7800filter.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`7800header.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`7800optimize.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`7800postprocess.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`7800preprocess.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`dasm.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.FolderOrPath,`distella.${architecture}.x86`));
        return result;
    }

    protected async RemoveCompilationFilesAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');

        // Notify
        this.notify(`Cleaning up files generated during compilation...`);

        // // Language specific files
        // if (this.CleanUpCompilationFiles)  {
        //     // Process
        //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`${this.FileName}.asm`));
        //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`bB.asm`));
        //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`includes.bB`));
        //     await filesystem.RemoveFile(path.join(this.WorkspaceFolder,`2600basic_variable_redefs.h`));
        // }

        // Debugger files (from workspace not bin)
        // Note: Remove if option is turned off as they are generated by bB (cannot change I believe)
        if (!this.GenerateDebuggerFiles) {
            await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
        }

        // Result
        return true;
    }
}
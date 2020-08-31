"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { CompilerBase } from "./compilerBase";

export class SeventyEightHundredBasicCompiler extends CompilerBase {

    constructor() {
        super("7800basic",
                "7800basic",
                [".bas",".78b"],
                [".a78",".bin"],
                path.join(application.Path,"out","bin","compilers","7800basic"),
                "A7800");
        
        // Debugger extensions
        this.DebuggerExtensions = new Map([["-s",".symbol.txt"],["-l",".list.txt"]]);
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
        
        // Command
        let command = `"${path.join(this.FolderOrPath, commandName)}"`;

        // Args
        let args = [
            `"${this.FileName}"`,
            this.Args
        ];

        // Environment
        let env : { [key: string]: string | null } = {};
        env["PATH"] = this.FolderOrPath;
        if (application.IsLinux || application.IsMacOS) {
            // Additional for Linux or MacOS
            env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
        }
        env["bas7800dir"] = this.FolderOrPath;

        // Notify
        // Linux and macOS script has this message already
        if (application.IsWindows) { application.WriteToCompilerTerminal(`Starting build of ${this.FileName}...`); } 

        // Compile
        this.IsRunning = true;
        let executeResult = await execute.Spawn(command, args, env, this.WorkspaceFolder,
            (stdout: string) => {
                // Prepare
                let result = true;

                // Validate
                if (stdout.includes("Fatal assembly error") || stdout.includes("Compilation failed.") || 
                        stdout.includes("Unrecoverable error(s) in pass, aborting assembly!") || 
                        stdout.includes("error:") ||
                        stdout.includes("segment:")) {
                    // Potential messages received (so far):
                    // Fatal assembly error: Source is not resolvable.
                    // Compilation failed.
                    // Unrecoverable error(s) in pass, aborting assembly!
                    // error: Label mismatch
                    // segment: INITIAL CODE SEGMENT
                    
                    // Failed
                    result = false;
                }

                // Result
                application.WriteToCompilerTerminal('' + stdout, false);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Validate
                if (stderr.includes("Permission denied") ||
                        stderr.includes("*** WARNING: the file size of")) {
                    // Potential messages received (so far):
                    // Permission denied
                    // *** WARNING: The file size of <file> isn't correct.
                    // *** ERROR, incmapfile couldn't open map file 'maps\level1.tmx' for reading

                    // Failed
                    result = false;
                }

                // Result
                application.WriteToCompilerTerminal('' + stderr, false);
                return result;
            });
        this.IsRunning = false;

        // Cleanup (regardless of state if chosen)
        application.WriteToCompilerTerminal(``, false); 

        // Finalise
        if (executeResult) { executeResult = await this.VerifyCompiledFileSizeAsync(); }
        await this.RemoveCompilationFilesAsync();
        if (executeResult) { executeResult = await this.MoveFilesToBinFolderAsync(); }
       
        // Result
        return executeResult;
    }

    // protected LoadConfiguration(): boolean {
    //     console.log('debugger:BatariBasicCompiler.LoadConfiguration');  

    //     // Base
    //     if (!super.LoadConfiguration()) return false;

    //     // Result
    //     return true;
    // }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) { return true; }

        // Prepare
        let platform = "Linux";
        if (application.IsMacOS) { platform = "Darwin"; }

        // Process
        let result = await filesystem.ChModAsync(path.join(this.FolderOrPath,'7800basic.sh'));
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800basic.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800filter.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800header.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800optimize.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800postprocess.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800preprocess.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800sign.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`7800makecc2.${platform}.${application.OSArch}`)); }
        if (result) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`dasm.${platform}.${application.OSArch}`)); }
     
        // Result
        return result;
    }

    protected async RemoveCompilationFilesAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');

        // Language specific files
        if (this.CleanUpCompilationFiles)  {
            // Notify
            application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);

            // Process
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`includes.7800`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`a78info.cfg`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800basic_variable_redefs.h`));
            // DMAHole
            // Not sure how many here??
            for (let index = 0; index < 25; index++) {
                await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800hole.${index}.asm`));
            }
        }

        // Debugger files (from workspace not bin)
        // Note: Remove if option is turned off as they are generated by 7800basic (cannot change I believe)
        if (!this.GenerateDebuggerFiles) {
            await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
        }

        // Result
        return true;
    }

}
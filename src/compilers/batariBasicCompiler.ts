"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { StopWatch } from '../stopwatch';
import { CompilerBase } from "./compilerBase";

export class BatariBasicCompiler extends CompilerBase {
    
    constructor() {
        // NOTE: '.ace' CompiledExtension requires all existing extensions to be stripped (-)
        super(application.BatariBasicLanguageId,
                "batari Basic",
                [".bas",".bb"],
                [".bin","-.ace"],[".bin"],
                path.join(application.Path,"out","bin","compilers","bB"),
                "Stella");
    }

    protected async GetCompilerVersionAsync(): Promise<void> {
        // Prepare
        const filePath: vscode.Uri = vscode.Uri.file(path.join(this.FolderOrPath, 'release.dat'));
        this.CompilerVersion = application.BATARIBASIC_WASMTIME_RELEASE;

        // Read contents of release.dat file
        if (await (filesystem.FileExistsAsync(filePath.fsPath))) {
            const fileContent = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/); 
            if (fileContent.length > 0 && application.IsNumber(fileContent[0])) { 
                this.CompilerVersion = parseFloat(fileContent[0]); 
            }
        }
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.ExecuteCompilerAsync');

        // Validate compiler files
        if (!await this.VerifyCompilerFilesAndPermissionsExistsAsync()) return false;

        // Compiler options
        let commandName = "2600bas.bat"; 
        if (application.IsLinux || application.IsMacOS) {
            // Linux or MacOS
            commandName = "./2600basic.sh";
        }
        
        // Command
        const command = `"${path.join(this.FolderOrPath, commandName)}"`;
        // Args
        const args = [
            `"${this.FileName}"`
        ];
        if (this.Args) args.push(this.Args);

        // Environment
        const env: Record<string, string> = {
            PATH: (process.env.PATH + ";" || '') + this.FolderOrPath,
            bB: this.FolderOrPath
        };
        // Additional for Linux or MacOS?
        if (application.IsLinux || application.IsMacOS) env["PATH"] += `${path.delimiter}/bin${path.delimiter}/usr/bin`;

        // Check for spaces in folder and file name
        this.ValidateIfProjectFolderAndFileContainsSpaces();

        // Spacer
        application.WriteToCompilerTerminal();

        // Start stopwatch
        const sw = new StopWatch();
        sw.Start();

        // TODO: These might need checking for the new WASMTIME build??

        // Compile
        this.IsRunning = true;
        let executeResult = await execute.Spawn(command, args, env, this.WorkspaceFolder,
            (stdout: string) => {
                // Prepare
                let result = true;
                const outMessage = stdout.toLowerCase();

                // Validate (batari Basic)
                if (outMessage.includes("compilation failed") || 
                    outMessage.includes("error:")) {
                    // Messages received (so far):
                    // Compilation failed
                    // error: Origin Reverse-indexed
                    // Fatal assembly error: Source is not resolvable.
                    // error: Unknown Mnemonic 'x'
                    // Unrecoverable error(s) in pass, aborting assembly!
                     
                     // Failed
                    result = false;
                }

                // Result
                application.WriteToCompilerTerminal(stdout, false, false);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;
                const errMessage = stderr.toLowerCase();

                // Validate
                if (errMessage.includes("parse error") || 
                    errMessage.includes("error:") || 
                    errMessage.includes("permission denied")) {
                    // Messages received (so far):
                    // Parse error
                    // Error: 
                    // Permission denied
                     
                    // Failed
                    result = false;

                } else if (errMessage.includes("cannot open includes.bb for reading")) {
                    // Special - seen this when the source is not processed correctly so we'll advise
                    // obviously doesn't get to the point of copying over this file
                    application.WriteToCompilerTerminal()
                    application.WriteToCompilerTerminal("WARNING: An unknown issue has occurred during compilation that may have affected your build....");

                    // Failed
                    result = false;
                }

                // Result                
                application.WriteToCompilerTerminal(stderr, false);
                return result;
            });
        this.IsRunning = false;

        // Finalise and output result
        sw.Stop();

        // Spacer
        application.WriteToCompilerTerminal(); 

        // Finalise
        if (executeResult) executeResult =  await this.VerifyCompiledFileSizeAsync();
        await this.RemoveCompilationFilesAsync(executeResult);
        if (executeResult) executeResult = await this.MoveFilesToBinFolderAsync();
        
        // Result
        return executeResult;
    }

    protected async RemoveCompilationFilesAsync(executeResult: boolean): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.RemoveCompilationFilesAsync');

        // Language specific files
        if (this.CleanUpCompilationFiles)  {
            // Notify
            application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);

            // Process
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`bB.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`includes.bB`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`2600basic_variable_redefs.h`));
            // Binary?
            if (!executeResult) await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.bin`));
        }

        // Debugger files (from workspace exludes bin - above)
        if (!this.GenerateDebuggerFiles || !executeResult) await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder)

        // Result
        return true;
    }

    protected GetCompilerFileList(): string[] {
        console.log('debugger:BatariBasicCompiler.GetCompilerFileList');

        // Prepare
        const command = (application.IsWindows ? "2600bas.bat" : "2600basic.sh");

        // for Wasmtime we only need to validate the script file by the looks from my testing...
        let compilerFileList = [command];

        // Validate if we are using an older version of bB
        // support 1.2-1.8
        if (this.CompilerVersion < application.BATARIBASIC_WASMTIME_RELEASE) {
            // Prepare
            let platform = "";
            if (application.IsLinux) platform = ".Linux";
            if (application.IsMacOS) platform = ".Darwin";
            const extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);

            // Default items
            compilerFileList.push(`2600basic${platform}${extension}`,
                `bbfilter${platform}${extension}`,
                `optimize${platform}${extension}`,
                `postprocess${platform}${extension}`,
                `preprocess${platform}${extension}`,
                `dasm${platform}${extension}`); 
            
            // As of 15/06/25 (v1.8) the existing ARM version does not cater for this file
            if (this.CompilerVersion == 1.8 && !application.IsMacOSArm) {
                compilerFileList.push(
                    `relocateBB${platform}${extension}`);
            }
        }
        // Return
        return compilerFileList;        
    }

    protected GetDebuggerFileList(): Map<string, string> {
        console.log('debugger:BatariBasicCompiler.GetDebuggerFileList');

        // Validate
        return new Map([["-s",".sym"], ["-l",".lst"]]);
    }

    protected async VerifyCompilerFilesAndPermissionsExistsAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.VerifyCompilerFilesAndPermissionsExistsAsync');

        // Verify
        let result = super.VerifyCompilerFilesAndPermissionsExistsAsync();

        // Is windows and older version?
        if (!result && application.IsWindows && this.CompilerVersion < application.BATARIBASIC_WASMTIME_RELEASE) {
            const message = "NOTE: your anti-virus software may have quarantined one or more files related to the compiler due to a false/positive test and where this is the case please ensure you whitelist to allow these files to used.  Alternatively try re-installing the extension.";
            application.WriteToCompilerTerminal(message);  
        }

        // Result
        return result;
    }
}
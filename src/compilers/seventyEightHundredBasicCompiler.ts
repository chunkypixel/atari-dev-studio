"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { StopWatch } from '../stopwatch';
import { CompilerBase } from "./compilerBase";

export class SeventyEightHundredBasicCompiler extends CompilerBase {

    constructor() {
        super(application.SeventyEightHundredBasicLanguageId,
                "7800basic",
                [".bas",".78b"],
                [".a78",".bin",".bin.CC2",".bin.versa"],[".a78",".bin"],
                path.join(application.Path,"out","bin","compilers","7800basic"),
                "A7800");

        // Launch options
        this.LaunchEmulatorOrCartOptionAvailable = true;
    }
    
    protected async GetCompilerVersionAsync(): Promise<void> {
		// Prepare
        const filePath: vscode.Uri = vscode.Uri.file(path.join(this.FolderOrPath, 'release.dat'));
        // Note: v0.21 and earlier didn't include the 'release.dat' file so we cannot support them properly unless file is manually added
        this.CompilerVersion = application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE;

        // Read contents of release.dat file
        if (await (filesystem.FileExistsAsync(filePath.fsPath))) {
            const fileContent = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/); 
            if (fileContent.length > 0 && application.IsNumber(fileContent[0])) { 
                this.CompilerVersion = parseFloat(fileContent[0]); 
            }
        }
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');

        // Validate compiler files
        if (!await this.VerifyCompilerFilesExistsAsync()) return false;

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Compiler options
        let commandName = "7800bas.bat";
        if (application.IsLinux || application.IsMacOS) {
            // Linux or MacOS
            commandName = "./7800basic.sh";
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
            bas7800dir: this.FolderOrPath
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

                // Validate
                if (outMessage.includes("compilation failed") ||
                    outMessage.includes("error:") ||
                    outMessage.includes("fatal assembly error") || 
                    outMessage.includes("unrecoverable error(s) in pass, aborting assembly!") || 
                    outMessage.includes("segment:")) {
                    // Messages received (so far):
                    // Fatal assembly error: Source is not resolvable.
                    // Compilation failed.
                    // Unrecoverable error(s) in pass, aborting assembly!
                    // error: Label mismatch
                    // segment: INITIAL CODE SEGMENT
                    
                    // Failed
                    result = false;
                }

                // Result
                application.WriteToCompilerTerminal(stdout, false);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;
                const errMessage = stderr.toLowerCase();

                // Validate
                if (errMessage.includes("permission denied") ||
                    errMessage.includes("*** warning: the file size of")) {
                    // Messages received (so far):
                    // Permission denied
                    // *** WARNING: The file size of <file> isn't correct.
                    // *** ERROR, incmapfile couldn't open map file 'maps\level1.tmx' for reading

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
        if (executeResult) executeResult = await this.VerifyCompiledFileSizeAsync();
        await this.RemoveCompilationFilesAsync(executeResult);
        if (executeResult) executeResult = await this.MoveFilesToBinFolderAsync();
       
        // Result
        return executeResult;
    }

    protected async RemoveCompilationFilesAsync(executeResult: boolean): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');

        // Language specific files
        if (this.CleanUpCompilationFiles)  {
            // Notify
            application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);

            // Process
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.pre`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`includes.7800`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`a78info.cfg`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800basic_variable_redefs.h`));
            // DMAHole
            for (let index = 0; index < 3; index++) {
                await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800hole.${index}.asm`));
            }
            // Banksets
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.bin`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.list.txt`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.symbol.txt`));
            // Binary?
            if (!executeResult) await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`${this.FileName}.bin`));
        }

        // Debugger files (from workspace exludes bin - above)
        if (!this.GenerateDebuggerFiles || !executeResult) await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);

        // Result
        return true;
    }

    protected GetCompilerFileList(): string[] {
        console.log('debugger:SeventyEightHundredBasicCompiler.GetCompilerFileList');

        // Prepare
        const command = (application.IsWindows ? "7800bas.bat" : "7800basic.sh");    
        // for Wasmtime we only need to validate the script file by the looks from my testing...
        const compilerFileList = [command];

        // Validate if we are using an older version of 7800basic
        // support 0.22-0.36 
        // Note: v0.21 and earlier didn't include the 'release.dat' file so we cannot support them properly unless file is manually added
        if (this.CompilerVersion < application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE) {
            // Prepare
            let platform = "";
            if (application.IsLinux) platform = ".Linux";
            if (application.IsMacOS) platform = ".Darwin";
            const extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);

            // Default items
            compilerFileList.push(`7800basic${platform}${extension}`,
                `7800filter${platform}${extension}`,
                `7800header${platform}${extension}`,
                `7800optimize${platform}${extension}`,
                `7800postprocess${platform}${extension}`,
                `7800preprocess${platform}${extension}`,
                `7800sign${platform}${extension}`,
                `7800makecc2${platform}${extension}`,
                `snip${platform}${extension}`);

            // As of 1/11/23 the existing ARM version does not cater for this file
            if (!application.IsMacOSArm) {
                compilerFileList.push(
                    `dasm${platform}${extension}`);     
            }

            // Append additional items (based on the version)
            if (this.CompilerVersion >= 0.22) {
                compilerFileList.push(
                    `7800rmtfix${platform}${extension}`,
                    `banksetsymbols${platform}${extension}`);
            }
            if (this.CompilerVersion >= 0.27) {
                compilerFileList.push(
                    `7800rmt2asm${platform}${extension}`);
            }

            // As of 8/06/25 (v0.34) the LZSA file is no longer used
            // As of 1/11/23 (v0.31) the existing ARM version does not cater for this file
            if (this.CompilerVersion >= 0.31 && this.CompilerVersion <= 0.33 && !application.IsMacOSArm) {
                compilerFileList.push(
                    `lzsa${platform}${extension}`);     
            }
        }
        // Return
        return compilerFileList;
    }

    protected GetDebuggerFileList(): Map<string, string> {
        console.log('debugger:SeventyEightHundredBasicCompiler.GetDebuggerFileList');

        // Return
        return new Map<string, string>([["-s",".symbol.txt"],["-l",".list.txt"]]);;
    }

    protected async VerifyCompilerFilesExistsAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.VerifyCompilerFilesExistsAsync');

        // Verfiy
        const result = super.VerifyCompilerFilesExistsAsync(); 
        if (!result && this.CompilerVersion < application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE) {
            const message = "NOTE: your anti-virus software may have quarantined one or more files related to the compiler due to a false/positive test and where this is the case please ensure you whitelist to allow these files to used.  Alternatively try re-installing the extension.";
            application.WriteToCompilerTerminal(message);  
        }

        // Result
        return result;
    }

    protected ShowAnyCompilerWarnings(): void {
        console.log('debugger:SeventyEightHundredBasicCompiler.ShowAnyCompilerWarnings');

        // Validate
        if (application.IsMacOSArm && this.CompilerVersion < application.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE) {
            const message = `WARNING: The latest working MacOS ARM version of 7800basic is a number of versions behind the official build (currently v${this.CompilerVersion}) and may not compile correctly due to missing features and functionality. Note: The officially included version built using WASM should support all Apple silicon where the wasmtime runtime is available.`;
            application.WriteToCompilerTerminal(message);
            application.WriteToCompilerTerminal(``);
        }
    }
}
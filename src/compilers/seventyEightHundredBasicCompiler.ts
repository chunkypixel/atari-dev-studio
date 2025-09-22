"use strict";
import * as vscode from 'vscode';
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
                [".a78",".bin",".bin.CC2",".bin.versa"],[".a78",".bin"],
                path.join(application.Path,"out","bin","compilers","7800basicwasm"),
                "A7800");
        
        // Debugger extensions
        this.DebuggerExtensions = new Map([["-s",".symbol.txt"],["-l",".list.txt"]]);
        // Launch options
        this.LaunchEmulatorOrCartOptionAvailable = true;
    }
    
    protected async GetCompilerVersionAsync(): Promise<void> {
		// Prepare
        const filePath: vscode.Uri = vscode.Uri.file(path.join(this.FolderOrPath, 'release.dat'));
        // min version of wasmtime releases of 7800basic/batariBasic
        this.CompilerVersion = application.WASMTIME_RELEASE;

        // attempt to read contents
        if (await (filesystem.FileExistsAsync(filePath.fsPath))) {
            let fileContent = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).toString().split(/\r?\n/); 
            if (!fileContent.any && application.IsNumber(fileContent[0])) { 
                this.CompilerVersion = parseFloat(fileContent[0]); 
            }
        }
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');

        // Validate compiler files
        // Note: for anti-virus quarantining
        if (!await this.VerifyCompilerFilesExistsAsync()) { return false; }

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
        let env: Record<string, string> = {
            PATH: (process.env.PATH + ";" || '') + this.FolderOrPath,
            bas7800dir: this.FolderOrPath
        };
        // Additional for Linux or MacOS?
        if (application.IsLinux || application.IsMacOS) env["PATH"] += `${path.delimiter}/bin${path.delimiter}/usr/bin`;

        // Spacer
        application.WriteToCompilerTerminal();

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
                application.WriteToCompilerTerminal(stdout, false);
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
                application.WriteToCompilerTerminal(stderr, false);
                return result;
            });
        this.IsRunning = false;

        // Spacer
        application.WriteToCompilerTerminal(); 

        // Finalise
        if (executeResult) { executeResult = await this.VerifyCompiledFileSizeAsync(); }
        await this.RemoveCompilationFilesAsync();
        if (executeResult) { executeResult = await this.MoveFilesToBinFolderAsync(); }
       
        // Result
        return executeResult;
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
            for (let index = 0; index < 3; index++) {
                await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`7800hole.${index}.asm`));
            }
            // Banksets
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.asm`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.bin`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.list.txt`));
            await filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder,`banksetrom.symbol.txt`));

        }

        // Debugger files (from workspace not bin)
        // Note: Remove if option is turned off as they are generated by 7800basic (cannot change I believe)
        if (!this.GenerateDebuggerFiles) {
            await this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
        }

        // Result
        return true;
    }

    protected GetCompilerFileList(): string[] {
        // Prepare
        let command = (application.IsWindows ? "7800bas.bat" : "7800basic.sh");
        
        // for Wasmtime we only need to validate the script file by the looks from my testing...
        let compilerFileList = [command];

        // Validate if we are using an older version of 7800basic
        if (this.CompilerVersion < application.WASMTIME_RELEASE) {
            let platform = "";
            if (application.IsLinux) { platform = ".Linux"; }
            if (application.IsMacOS) { platform = ".Darwin"; }
            let extension = (application.IsWindows ? ".exe" : `.${application.OSArch}`);

            // Yes! can only be version 0.22-0.36 as versions before will NOT include the release.dat file
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
            if (this.CompilerVersion >= 0.31 && this.CompilerVersion <= 0.33 && 
                !application.IsMacOSArm) {
                compilerFileList.push(
                    `lzsa${platform}${extension}`);     
            }
        }
        // Return
        return compilerFileList;
    }

    protected ShowAnyCompilerWarnings(): void {
        console.log('debugger:SeventyEightHundredBasicCompiler.ShowAnyCompilerWarnings');

        if (application.IsMacOSArm && this.CompilerVersion < application.WASMTIME_RELEASE) {
            let message = `WARNING: The included MacOS ARM version of 7800basic is a number of versions behind the official build (currently v${this.CompilerVersion}) and may not compile correctly due to missing features and functionality.`;
            application.WriteToCompilerTerminal(message);
            application.WriteToCompilerTerminal(``);
        }
    }

}
"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as application from '../application';
import * as filesystem from '../filesystem';
import { CompilerBase } from "./compilerBase";

export class SeventyEightHundredBasicCompiler extends CompilerBase {

    constructor() {
        super("7800basic", [".bas",".78b"], path.join(application.Path,"out","bin","7800basic"));
    }
    
    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Result
        return true;
    }

    protected LoadConfiguration(): boolean {
        console.log('debugger:SeventyEightHundredBasicCompiler.LoadConfiguration');  

        // Base
        if (!super.LoadConfiguration()) return false;

        // Compiler
        let userCompilerFolder = this.configuration.get<string>("7800basic.compilerFolder");
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                let message = `ERROR: Cannot locate your chosen 7800basic compiler folder '${userCompilerFolder}'`;
                this.outputChannel.appendLine(message);
                console.log(`debugger:${message}`);
                return false;
            }

            // Set
            this.CompilerFolder = userCompilerFolder;
            this.CustomCompilerFolder = true;
        }
        let userCompilerArgs = this.configuration.get<string>("7800basic.compilerArgs");
        if (userCompilerArgs) this.CompilerArgs = userCompilerArgs;

        // Result
        return true;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomCompilerFolder || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.SetChMod(path.join(this.CompilerFolder,'7800basic.sh'));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`7800basic.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`7800filter.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`7800header.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`7800optimize.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`7800postprocess.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`7800preprocess.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`dasm.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`distella.${architecture}.x86`));
        return result;
    }
}
"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as application from '../application';
import * as filesystem from '../filesystem';
import { CompilerBase } from "./compilerBase";

export class BatariBasicCompiler extends CompilerBase {

    constructor() {
        super("batari Basic", [".bas",".bb"], path.join(application.Path,"out","bin","bb"));
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.ExecuteCompilerAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Result
        return true;
    }

    protected LoadConfiguration(): boolean {
        console.log('debugger:BatariBasicCompiler.LoadConfiguration');  

        // Base
        if (!super.LoadConfiguration()) return false;

        // Compiler
        let userCompilerFolder = this.configuration.get<string>("batariBasic.compilerFolder");
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                let message = `ERROR: Cannot locate your chosen batari Basic compiler folder '${userCompilerFolder}'`;
                this.outputChannel.appendLine(message);
                console.log(`debugger:${message}`);
                return false;
            }

            // Set
            this.CompilerFolder = userCompilerFolder;
            this.CustomCompilerFolder = true;
        }
        let userCompilerArgs = this.configuration.get<string>("batariBasic.compilerArgs");
        if (userCompilerArgs) this.CompilerArgs = userCompilerArgs;

        // Result
        return true;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:BatariBasicCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomCompilerFolder || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.SetChMod(path.join(this.CompilerFolder,'2600basic.sh'));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`2600basic.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`dasm.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`bbfilter.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`optimize.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`postprocess.${architecture}.x86`));
        if (result) result = await filesystem.SetChMod(path.join(this.CompilerFolder,`preprocess.${architecture}.x86`));
        return result;
    }

}
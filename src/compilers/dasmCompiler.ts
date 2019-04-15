"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as application from '../application';
import * as filesystem from '../filesystem';
import { CompilerBase } from "./compilerBase";

export class DasmCompiler extends CompilerBase {

    constructor() {
        super("dasm", [".dasm",".asm",".a",".h"], path.join(application.Path,"out","bin","dasm"));
            
    }
    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.ExecuteCompilerAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Result
        return true;
    }

    protected LoadConfiguration(): boolean {
        console.log('debugger:DasmCompiler.LoadConfiguration');  

        // Base
        if (!super.LoadConfiguration()) return false;

        // Compiler
        let userCompilerFolder = this.configuration.get<string>("dasm.compilerFolder");
        if (userCompilerFolder) {
            // Validate (user provided)
            if (!filesystem.FolderExists(userCompilerFolder)) {
                let message = `ERROR: Cannot locate your chosen dasm compiler folder '${userCompilerFolder}'`;
                this.outputChannel.appendLine(message);
                console.log(`debugger:${message}`);
                return false;
            }

            // Set
            this.CompilerFolder = userCompilerFolder;
            this.CustomCompilerFolder = true;
        }
        let userCompilerArgs = this.configuration.get<string>("dasm.compilerArgs");
        if (userCompilerArgs) this.CompilerArgs = userCompilerArgs;
        let userCompilerFormat = this.configuration.get<string>("dasm.compilerFormat");
        if (userCompilerFormat) this.CompilerFormat = userCompilerFormat;
        let userCompilerVerboseness = this.configuration.get<string>("dasm.compilerVerboseness");
        if (userCompilerVerboseness) this.CompilerVerboseness = userCompilerVerboseness;

        // Result
        return true;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:DasmCompiler.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomCompilerFolder || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.SetChMod(path.join(this.CompilerFolder,`dasm.${architecture}.x86`));
        return result;
    }
}
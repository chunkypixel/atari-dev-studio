"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { CompilerBase } from "./compilerBase";

export class MakeCompiler extends CompilerBase {

    // Features

    constructor() {
        super("makefile",
            "makefile",
            ["makefile"],
            [""],
            "",
            "")
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.ExecuteCompilerAsync');

        // Compiler options
        let command = this.FolderOrPath;
        let args = [
            `-f ${this.FileName}`
        ]
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

                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = false;
                                
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
        this.IsRunning = false;

        // Notify
        application.CompilerOutputChannel.appendLine(`Finished...`); 
       
        // Result
        return executeResult;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.LoadConfigurationAsync'); 

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) { return false; }

        // Path
        //this.FolderOrPath = path.join(this.WorkspaceFolder,'make');
        this.FolderOrPath = 'make';

        // Result
        return true;
    }
}
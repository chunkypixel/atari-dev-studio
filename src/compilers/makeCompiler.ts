"use strict";
import * as vscode from 'vscode';
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

    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.InitialiseAsync');

        // Prepare
        let result = true;

        // Already running?

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = application.GetConfiguration();

        // Activate output window?
        if (!this.Configuration.get<boolean>(`editor.preserveCodeEditorFocus`))  {
            application.MakeTerminal.show();
        }

        // Clear output content? (not available for terminals)

        // Save files?
        if (this.Configuration.get<boolean>(`editor.saveAllFilesBeforeRun`))  {
            result = await vscode.workspace.saveAll();
        } else if (this.Configuration.get<boolean>(`editor.saveFileBeforeRun`)) {
            if (this.Document) { result = await this.Document.save(); }
        }
        if (!result) { return false; }

        // Configuration
        result = await this.LoadConfigurationAsync();
        if (!result) { return false; }

         // Result
        return true;
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.ExecuteCompilerAsync');

        // Launch
        application.MakeTerminal.sendText('make')
        
        // Result
        return (application.MakeTerminal.exitStatus?.code == 0);
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.LoadConfigurationAsync'); 

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) { return false; }

        // Set state
        this.UsingMakeFile = true;

        // Result
        return true;
    }
}
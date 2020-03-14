"use strict";
import * as vscode from 'vscode';
import * as application from '../application';
import { CompilerBase } from "./compilerBase";

export class MakeCompiler extends CompilerBase {

    // Features

    constructor() {
        super("makefile",
            "makefile",
            ["makefile"],
            [""],
            "",
            "");
    }

    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.InitialiseAsync');

        // Prepare
        let result = true;

        // Already running?

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = application.GetConfiguration();

        // Configuration
        result = await this.LoadConfigurationAsync();
        if (!result) { return false; }

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

         // Result
        return true;
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.ExecuteCompilerAsync');

        // Launch and exit
        // note: we cannot wait for a result
        application.MakeTerminal.sendText(`cd ${this.WorkspaceFolder}`);
        application.MakeTerminal.sendText(`make -f ${this.FileName}`);
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.LoadConfigurationAsync'); 

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) { return false; }

        // Flag
        this.UsingMakeCompiler = true;

        // Result
        return true;
    }
}
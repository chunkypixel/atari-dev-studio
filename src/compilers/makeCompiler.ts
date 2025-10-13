"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import { CompilerBase } from "./compilerBase";

export class MakeCompiler extends CompilerBase {

    // Features

    constructor() {
        super("makefile",
            "makefile",
            ["makefile"],
            [""],[""],
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

        // Initialise terminal
        await application.InitialiseAdsTerminalAsync();

        // Activate output window?
        if (!this.Configuration.get<boolean>(`editor.preserveCodeEditorFocus`))  {
            application.AdsTerminal?.show();
        }

        // Clear output content? (not available for terminals)

        // Save files (based on user configuration)
        result = await this.SaveAllFilesBeforeRun()
        if (!result) { return false; }

         // Result
        return true;
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.ExecuteCompilerAsync');

        // Write system and VSCode version to log
        application.WriteEnvironmentSummaryToCompilerTerminal();

        // Launch and exit
        // note: we cannot wait for a result
        application.AdsTerminal?.sendText(`make -f ${this.FileName}`);
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.LoadConfigurationAsync'); 

        // System
        this.UsingMakeFileCompiler = true;
        this.FileName = path.basename(this.Document!.fileName);

        // Result
        return true;
    }

}
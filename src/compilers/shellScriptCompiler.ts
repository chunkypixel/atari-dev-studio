"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import * as configuration from '../configuration';
import { CompilerBase } from "./compilerBase";

export class ShellScriptCompiler extends CompilerBase {

    // Features

    constructor() {
        super("shellscript",
            "Shell Script",
            ["sh"],
            [""],[""],
            "",
            "");
    }

    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:ShellCompiler.InitialiseAsync');

        // Prepare
        let result = true;

        // Already running?

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = configuration.GetAtariDevStudioConfiguration();

        // Configuration
        result = await this.LoadConfigurationAndSettingsAsync();
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
        console.log('debugger:ShellCompiler.ExecuteCompilerAsync');

        // Launch and exit
        // note: we cannot wait for a result
        application.AdsTerminal?.sendText(`${this.FileName}`);
        return true;
    }

    protected async LoadConfigurationAndSettingsAsync(): Promise<boolean> {
        console.log('debugger:ShellCompiler.LoadConfigurationAndSettingsAsync'); 

        // System
        this.UsingShellScriptCompiler = true;
        this.FileName = path.basename(this.Document!.fileName);

        // Result
        return true;
    }
}
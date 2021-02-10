"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import { CompilerBase } from "./compilerBase";

export class BatchCompiler extends CompilerBase {

    // Features

    constructor() {
        super("bat",
            "Batch",
            ["bat"],
            [""],[""],
            "",
            "");
    }

    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:BatchCompiler.InitialiseAsync');

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
        console.log('debugger:BatchCompiler.ExecuteCompilerAsync');

        // Launch and exit
        // note: we cannot wait for a result
        application.AdsTerminal?.sendText(`${this.FileName}`);
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:BatchCompiler.LoadConfigurationAsync'); 

        // System
        this.UsingBatchCompiler = true;
        this.FileName = path.basename(this.Document!.fileName);

        // Result
        return true;
    }
}
"use strict";
import * as path from 'path';
import * as application from '../application';
import * as configuration from '../configuration';
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
        this.Configuration = configuration.GetAtariDevStudioConfiguration();

        // Configuration
        result = await this.LoadConfigurationAndSettingsAsync();
        if (!result) return false;

        // Initialise terminal
        await application.InitialiseAdsTerminalAsync();

        // Activate output window?
        if (!this.Configuration.get<boolean>(`editor.preserveCodeEditorFocus`))  {
            application.AdsTerminal?.show();
        }

        // Clear output content? (not available for terminals)

        // Save files (based on user configuration)
        result = await this.SaveAllFilesBeforeRun()
        if (!result) return false;

         // Result
        return true;
    }

    protected async ExecuteCompilerAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.ExecuteCompilerAsync');

        // Launch and exit
        // NOTE: we cannot wait for a result
        application.AdsTerminal?.sendText(`make -f .\\${this.FileName}`);
        return true;
    }

    protected async LoadConfigurationAndSettingsAsync(): Promise<boolean> {
        console.log('debugger:MakeCompiler.LoadConfigurationAndSettingsAsync'); 

        // System
        this.UsingMakeFileCompiler = true;
        this.FileName = path.basename(this.Document!.fileName);

        // Result
        return true;
    }

}
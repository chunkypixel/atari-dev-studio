"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ExecuteCommand } from '../execute';
import { Writable } from 'stream';
const cp = require("child_process");
const os = require("os");

export abstract class CompilerBase implements vscode.Disposable {

    // features
    public isRunning: boolean = false;
    readonly channelName: string = "compiler";
    public readonly CompilerName: string;
    public readonly CompilerExtensions: string[];
    readonly outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(this.channelName);

    constructor(compilerName: string, compilerExtensions: string[]) {
        this.CompilerName = compilerName;
        this.CompilerExtensions = compilerExtensions;
    }

    public dispose(): void {
        console.log('debugger:compilerBase.dispose');
    }

    public async BuildGameAsync(fileUri: vscode.Uri): Promise<boolean> {
        return true;
        //return await this.launchEmulatorAsync();
    }

    public async BuildGameAndRunAsync(fileUri: vscode.Uri): Promise<boolean> {
        return true;
    }

    protected abstract ExecuteBuildAsync(fileUri: vscode.Uri): Promise<boolean> 

    protected async launchEmulatorAsync(): Promise<boolean> {
        // options
        let output: Writable = new Writable();
        let command = "path";
        let args = [
            "arg1"
        ];
        let env : { [key: string]: string | null } = {};

        // Process
        this.outputChannel.appendLine('Launching emulator...'); 
        let result = await ExecuteCommand(output, command, args, env, "path");

        // Return
        return result;
    }
}

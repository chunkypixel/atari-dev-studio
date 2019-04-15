"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CompilerBase } from "./compilerBase";

export class SeventyEightHundredBasicCompiler extends CompilerBase {

    constructor() {
        super("7800basic", [".bas",".78b"])
    }
    
    protected async ExecuteBuildAsync(fileUri: vscode.Uri): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
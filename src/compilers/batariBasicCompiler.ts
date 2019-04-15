"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CompilerBase } from "./compilerBase";

export class BatariBasicCompiler extends CompilerBase {

    constructor() {
        super("batari Basic", [".bas",".bb"])
    }

    protected async ExecuteBuildAsync(fileUri: vscode.Uri): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}
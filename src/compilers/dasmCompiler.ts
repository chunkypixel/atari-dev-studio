"use strict";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CompilerBase } from "./compilerBase";

export class DasmCompiler extends CompilerBase {

    constructor() {
        super("dasm", [".dasm",".asm",".a",".h"]);
            
    }
    protected async ExecuteBuildAsync(fileUri: vscode.Uri): Promise<boolean> {
            throw new Error("Method not implemented.");
    }
}
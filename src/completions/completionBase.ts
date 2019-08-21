"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';

export abstract class CompletionBase {

    public readonly Id:string;

    constructor(id:string) {
        this.Id = id;
    }

    public abstract RegisterAsync(context: vscode.ExtensionContext): Promise<void>;

	//
	// Load and parse a file located in .../completions 
	//
	// The files are in markdown format with the keywords on each line
	//
	protected async LoadCompletionFileAsync(context: vscode.ExtensionContext, filename: string): Promise<vscode.CompletionItem[]> {
        // prepare
        const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'completions', filename));
        const fileArrary = (await filesystem.ReadFileAsync(filePath.fsPath)).toString().split(/\r?\n/);
        let autoCompletes: vscode.CompletionItem[] = [];

        // process
        fileArrary.forEach((element: string) => {
            if (element !== undefined) { autoCompletes.push(new vscode.CompletionItem(element,vscode.CompletionItemKind.Keyword)); }
        });

        // return
        return autoCompletes;
	}
  
}
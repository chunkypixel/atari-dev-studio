"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from "../application";
import * as filesystem from '../filesystem';
import open = require('open');

export abstract class ContextHelpBase {

    public readonly Id:string;
    public readonly Url:string;
    private links: { [key: string]: string; } = {};

    constructor(id:string, url:string) {
        this.Id = id;
        this.Url = url;
    }

    public abstract RegisterAsync(context: vscode.ExtensionContext): Promise<void>

    protected async LoadContextHelpFileAsync(context: vscode.ExtensionContext, filename: string): Promise<void> {
		const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'contexthelp', filename));
		const fileArrary = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).toString().split(/\r?\n/);

        // Process
        for (const line of fileArrary) {
            // split (into 2) and validate length
            var content = line.split("|");
            if (content.length != 2) continue;

            // store?
            this.links[content[0].toLowerCase()] = content[1].toLowerCase();
        }
    }

    public async OpenContextHelpAtCursorAsync(document: vscode.TextDocument, position: vscode.Position): Promise<void> {
        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) { return undefined; }

        // get selected word
        let word = document.getText(wordRange);
        if (!word) { return undefined; }

        // Find a match
        var content = this.links[word.toLowerCase()];
        if (content) {
            // Yes got one
            var url = this.Url + '#' +content;
            await application.OpenBrowserWindow(url);
        }
    }

}
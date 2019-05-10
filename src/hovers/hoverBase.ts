"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';

export abstract class HoverBase implements vscode.HoverProvider {

    public readonly Id:string
    private hoverText: { [key: string]: string; } = {};

    constructor(id:string) {
        this.Id = id;
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void> {
        // In class extension call LoadHoverFile first then super back to here

        // Complete registration
        vscode.languages.registerHoverProvider(this.Id, this);
    }

	//
	// Load and parse a file located in .../hovers 
	//
	// The files are plain text with the keywords in the first column
	// followed by the description indented.
	//
	// Each entry in the file is appended to the hoverText[] array to be used
	// when looking up the keyword the user is hovering over
	//
	protected async LoadHoverFileAsync(context: vscode.ExtensionContext, filename: string): Promise<void> {
		const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'hovers', filename));
		let arr = (await filesystem.ReadFileAsync(filePath.fsPath)).toString().split(/\r?\n/);
		let txt='';
		for (let i=0; i<arr.length; i++) {
			if (arr[i].length>0 && arr[i].charAt(0)>' ') {
				if (txt.length>0) {
					let key=''
					let p=0;
					while (txt.charAt(p)>' ') key+=txt.charAt(p++);
					this.hoverText[key]=txt.trim();
					txt='';
				} 
			}
			txt+=arr[i]+'\r\n';
		}
	}

	provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
		const validchars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
		let word=''
		let p=position.character;
		const line=String(document.lineAt(position.line).text);
		
		// Find beginning of the hower-word
		while (p>0 && validchars.indexOf(line[p])!=-1) p--;
		// Skip leading invalid character
		if (validchars.indexOf(line[p])==-1) p++;
		// Collect string until an invalid charecter is encountered
		while (p<line.length && validchars.indexOf(line[p])!=-1) word+=line[p++];

		return new vscode.Hover(this.hoverText[word.toUpperCase()]);
	}
}

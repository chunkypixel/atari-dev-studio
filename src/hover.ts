"use strict";
import * as vscode from 'vscode';
import * as application from './application';
import * as fs from 'fs';
import * as path from 'path';


export class Hover {
	private hoverText: { [key: string]: string; } = {};

	// The 6502.txt file is copied from 
	// https://www.masswerk.at/6502/6502_instruction_set.html
	constructor(context: vscode.ExtensionContext) {
		this.loadHoverFile(context, '6502.txt') // 6502 opcodes
		this.loadHoverFile(context, 'vcs.txt')  // Stella & RIOT
	}


	//
	// Load and parse a file located in .../src/hover/ 
	//
	// The files are plain text with the keywords in the first column
	// followed by the description indented.
	//
	// Each entry in the file is appended to the hoverText[] array to be used
	// when looking up the keyword the user is hovering over
	//
	loadHoverFile(context: vscode.ExtensionContext, filename: string) {
		const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'hover', filename));
		let arr = fs.readFileSync(filePath.fsPath).toString().split(/\r?\n/);
		let txt='';
		for (let i=0; i<arr.length; i++) {
			if (arr[i].length>0 && arr[i].charAt(0)>' ') {
				if (txt.length>0) {
					let key=''
					let p=0;
					while (txt.charAt(p)>' ') key+=txt.charAt(p++);
					this.hoverText[key]=txt;
					txt='';
				} 
			}
			txt+=arr[i]+'\r\n';
		}
	}


	provideHover(doc: vscode.TextDocument,pos: vscode.Position, token: vscode.CancellationToken) {
		const validchars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
		let word=''
		let p=pos.character;
		const line=String(doc.lineAt(pos.line).text);
		
		// Find beginning of the hower-word
		while (p>0 && validchars.indexOf(line[p])!=-1) p--;
		// Skip leading invalid character
		if (validchars.indexOf(line[p])==-1) p++;
		// Collect string until an invalid charecter is encountered
		while (p<line.length && validchars.indexOf(line[p])!=-1) word+=line[p++];

		return new vscode.Hover(this.hoverText[word.toUpperCase()]);
	}

}

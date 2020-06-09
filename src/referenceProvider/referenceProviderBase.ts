"use strict";
import * as vscode from 'vscode';

export abstract class ReferenceProviderBase implements vscode.ReferenceProvider {

    public readonly Id:string;

    constructor(id:string) {
        this.Id = id;
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void>
    {
        // Complete registration
        vscode.languages.registerReferenceProvider(this.Id, this);
    }

    // Used for both 7800basic and batariBasic

    provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
        // prepare
        let definitions: vscode.Location[] = [];

        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) { return undefined; }

        // get selected word
        let word = document.getText(wordRange)?.toLowerCase();
        if (!word) { return undefined;}

        // process
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // validate
            let line:vscode.TextLine = document.lineAt(lineIndex);
            if (line.isEmptyOrWhitespace) { continue; }

            // get line
			let lineText:string = line.text
			.slice(line.firstNonWhitespaceCharacterIndex)
            .replace('\t', ' ');

            // get keywords
            let keywords:string[] = lineText.split(' ');
            if (keywords.length < 0) { continue; }

            // validate
            for (var keywordIndex = 0; keywordIndex < keywords.length; keywordIndex++) {
                // Prepare
                var keyword = keywords[keywordIndex].toLowerCase();
                if (keyword.startsWith(';') || keyword.startsWith('rem') || keyword.startsWith('/*')) { break; }
                
                // match?
                if (keyword.startsWith(word)) {
                    // position of word on line
                    let wordIndex = line.text.indexOf(keywords[keywordIndex]);
                    if (wordIndex < 0) { wordIndex = 0; }

                    // store and exit for
                    definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, wordIndex)));                
                }
            }

        }

        // return
        return definitions;
    }
    
}
"use strict";
import * as vscode from 'vscode';

export abstract class DefinitionProviderBase implements vscode.DefinitionProvider {

    public readonly Id:string;

    constructor(id:string) {
        this.Id = id;
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void>
    {
        // Complete registration
        vscode.languages.registerDefinitionProvider(this.Id, this);
    }

    // Used for both 7800basic and batariBasic

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
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
            let firstKeyword: string = keywords[0].toLowerCase();

            // Notes:
            // for methods need to be the first word (no spaces)
            // for other definitions need to be dim, const (vars), function or macros
            if (line.text.startsWith(' ')) {
                // validate
                if (firstKeyword === 'dim' || firstKeyword === 'const' || firstKeyword === 'function' || firstKeyword === 'macro' ||
                    firstKeyword.search('data') > -1) {
                    for (var keywordIndex = 0; keywordIndex < keywords.length; keywordIndex++) {
                        // Prepare
                        var keyword = keywords[keywordIndex].toLowerCase();
                        if (keyword === '=' || keyword.startsWith(';') || keyword.startsWith('rem') || keyword.startsWith('/*')) { break; }

                        // match?
                        if (keyword.startsWith(word)) {
                            // position of word on line
                            let wordIndex = line.text.indexOf(keywords[keywordIndex]);
                            if (wordIndex < 0) { wordIndex = 0; }

                            // store and exit for
                            definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, wordIndex)));
                            break;                    
                        }
                    }
                }
            }
            else
            {
                // validate method
                if (firstKeyword === word) {
                    // store
                    definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)));
                }
            }

        }

        // return
        return definitions;
    }

}
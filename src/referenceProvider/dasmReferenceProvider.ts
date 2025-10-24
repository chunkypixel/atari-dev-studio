"use strict";
import * as vscode from 'vscode';
import { ReferenceProviderBase } from './referenceProviderBase';

export class DasmReferenceProvider extends ReferenceProviderBase {
    
    constructor() {
        super("dasm");
    }

    provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
        // prepare
        let definitions: vscode.Location[] = [];

        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return undefined;

        // get selected word
        let word = document.getText(wordRange);
        if (!word) return undefined;

        // process
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // validate
            let line:vscode.TextLine = document.lineAt(lineIndex);
            if (line.isEmptyOrWhitespace) continue;

            // get line
            let lineText:string = line.text
            .slice(line.firstNonWhitespaceCharacterIndex);

            // get keywords
            let keywords: string[] = lineText.split(/[\s\t]+/);
            if (keywords.length < 0) continue;

            // validate
            for (var keywordIndex = 0; keywordIndex < keywords.length; keywordIndex++) {
                // Prepare
                var keyword = keywords[keywordIndex];
                
                // match?
                if (keyword.includes(word)) {
                    if (keyword.length !== word.length) {
                        // is next character a letter? if so not a full match
                        // we need to verify this to get exact matches where line is NOT spaced between fields
                        let position = keyword.indexOf(word);
                        let char = keyword.substring(position + word.length, position + word.length + 1);
                        if (char !== '' && char !== '=' && char !== ',' && char !== '(' && char !== ')' && 
                            char !== '/' && char !== '*' && char !== '+' && char !== '-') break;
                    }

                    // position of word on line
                    let wordIndex = line.text.indexOf(keywords[keywordIndex]);
                    if (wordIndex < 0) wordIndex = 0;

                    // store and exit for
                    definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, wordIndex)));                
                }
            }
        }

        // return
        return definitions;
    }
}
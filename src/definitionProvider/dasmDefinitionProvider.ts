"use strict";
import * as vscode from 'vscode';
import { DefinitionProviderBase } from './definitionProviderBase';

export class DasmDefinitionProvider extends DefinitionProviderBase {
    
    constructor() {
        super("dasm");
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        // prepare
        let definitions: vscode.Location[] = [];

        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) { return undefined; }

        // get selected word
        let word = document.getText(wordRange);
        if (!word) { return undefined; }

        // process
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // get
            let line:vscode.TextLine = document.lineAt(lineIndex);
            
            // validate
            if (line.isEmptyOrWhitespace) { continue; }
            if (line.text.startsWith(' ') || line.text.startsWith('\t')) { continue; }

            // get line
            let lineText:string = line.text
            .slice(line.firstNonWhitespaceCharacterIndex);

            // validate - remark
            if (lineText.startsWith(';') || lineText.startsWith('*')) { continue; }

            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords: string[] = lineText.split(/[\s\t]+/,3);
            if (keywords.length < 0) { continue; }

            // Notes:
            // for labels need to be the first word (no spaces)
            // Ensure we compare actual case
            // Need to check for label tags
            if (keywords[0] === word || keywords[0].startsWith('.' + word) || keywords[0].endsWith(word + ':'))  {
                // store
                definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)));
            }

        }
                
        // return
        return definitions;
    }
}
"use strict";
import * as vscode from 'vscode';
import { OutlineBase } from './outlineBase';

export class SeventyEightHundredBasicOutline extends OutlineBase {
    
    constructor() {
        super("7800basic");
    }

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        // prepare
        let symbols: vscode.DocumentSymbol[] = [];
        let containers: vscode.DocumentSymbol[] = [];
        let isWithinMethod = false;

        // Scan
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // Get line
            const line:vscode.TextLine = document.lineAt(lineIndex);
           
            // Validation
            if (line.isEmptyOrWhitespace) { continue; }

            // Extend container range
			containers.forEach( container => {
				container.range = new vscode.Range(
					container.selectionRange.start,
					line.range.end
				);
            });

			// Get a clean line to compare against
			const lineText:string = line.text
			.slice(line.firstNonWhitespaceCharacterIndex)
			.replace( '\t', ' ' );
            if (lineText.length < 2) { continue; }

            // Break down works in line
            let keywords:string[] = lineText.split(' ');
			if (keywords.length < 0) { continue; }
			let firstWord: string = keywords[0].toLowerCase();

            // preapre
            let isSymbolKind:vscode.SymbolKind | undefined = undefined;
            let isContainer:boolean = false;    
            let symbolName:string = '';
            let symbolDetail:string = '';

            // Symbols
            switch (firstWord) {
                case 'bank':
                    // initialise
                    isSymbolKind = vscode.SymbolKind.Class;
                    isContainer = true;
                    isWithinMethod = false;

                    // Get name (append bank number)
                    symbolName = firstWord;
                    if (keywords[0].length > 1) { symbolName += ` ${keywords[1]}`;} 

                    // Reset container to root
                    while (containers.length > 0) {
                        containers.pop();
                    }

                    break;
                case ";":
                case "rem":
                case "/*":
                    // remmarks
                    break;
                case 'asm':
                case 'data':
                case 'end':
                case 'return':
                    // do nothing for now
                    break;
                case 'dmahole':
                    break;                
                default:
                    // initialise
                    // anything indented does not get processed in this language
                    if (line.text.startsWith(' ') || line.text.startsWith('\t')) { break; }

                    // prepare
                    let isSubFunction:boolean = firstWord.startsWith('_');
                    isContainer = !isSubFunction;
                    symbolName = keywords[0];  

                    // method or sub-function within method)
                    isSymbolKind = (isSubFunction ? vscode.SymbolKind.Variable : vscode.SymbolKind.Function);
                    if (isSubFunction) { symbolDetail = '(sub)'; }

                    // are we already is a method (and not a sub-method)
                    if (isContainer && isWithinMethod) { containers.pop();} 

                    // set flag
                    isWithinMethod = true;
                    break;
            }

            // Add symbol?
            if (isSymbolKind) {
                // initialise
                let symbol = new vscode.DocumentSymbol(
                    symbolName,
                    symbolDetail,
                    isSymbolKind,
                    line.range, line.range
                );

                // store
                if (containers.length > 0) {
                    // child
                    containers[containers.length-1].children.push(symbol);
                }
                else
                {
                    // parent
                    symbols.push(symbol);
                }

                // Store as a container?
                if (isContainer) { containers.push(symbol); }
            }
            
        }

        // return result
        return symbols;
    }
}
"use strict";
import * as vscode from 'vscode';
import { DocumentSymbolProviderBase } from './documentSymbolProviderBase';

export class DasmDocumentSymbolProvider extends DocumentSymbolProviderBase {
    
    constructor() {
        super("dasm");
    }

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> 
    {
        // prepare
        let symbols: vscode.DocumentSymbol[] = [];
        let containers: vscode.DocumentSymbol[] = [];
        let isWithinLabel = false;
        let isWithinMacro = false;
        let prevLine: vscode.TextLine;

        // Scan
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // get
            let line: vscode.TextLine = document.lineAt(lineIndex);

            // extend container range
            containers.forEach(container => {
                // note: for this work correctly (for open methods) set the range we need to set the range to the 
                // previous row not the current one
                container.range = new vscode.Range(
                    container.selectionRange.start,
                    prevLine.range.end
                );
            });

            // store (for expanding container)
            prevLine = line;

            // validate
            if (line.isEmptyOrWhitespace) { continue; }

            // get line
            let lineText: string = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);

            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords: string[] = lineText.split(/[\s\t]+/,3);
            if (keywords.length < 0) { continue; }
            let mainKeyword: string = keywords[0].toLowerCase();

            // validate - remark
            if (mainKeyword.startsWith(';') || mainKeyword.startsWith('*')) { continue; }

            // prepare
            let symbolKind: vscode.SymbolKind | undefined = undefined;
            let isContainer: boolean = false;
            let symbolName: string = '';
            let symbolDetail: string = '';

            // symbols
            switch (mainKeyword) {
                case 'mac':
                    if (keywords.length >= 2) {
                        // initialise
                        symbolName = keywords[1];
                        // append function or macro tag
                        symbolDetail = `${mainKeyword}`;
                        symbolKind = vscode.SymbolKind.Module;
                        isWithinMacro = true;
                        isContainer = true;

                        // is in a label?
                        if (isWithinLabel) {
                            containers.pop();
                            isWithinLabel = false;
                        }
                    }
                    break;
                case 'endm':
                    // validate
                    if (isWithinMacro) {
                        isWithinMacro = false;
                        containers.pop();
                        break;
                    }
                    break;
                default:
                    // validate
                    // anything indented at this point does not get processed
                    if (line.text.startsWith(' ') || line.text.startsWith('\t')) { continue; }

                    // is variable?
                    let isVariable = false;
                    if (keywords.length > 1) {
                        for (var index = 1; index < keywords.length; index++){
                            // validate
                            let validateKeyword = keywords[index].toLowerCase();
                            if (validateKeyword === '=' || validateKeyword.includes('equ') ||
                                validateKeyword.includes('byte') || validateKeyword.includes('.word') || 
                                validateKeyword.includes('db') || validateKeyword.includes('ds')) {
                                    // flag
                                    isVariable = true;
                                    break;
                                }
                        }
                        // exit?
                        if (isVariable) { continue; }
                    } 
                    
                    // get keyword
                    let keyword = keywords[0];
                    if (keyword.endsWith(':')) { keyword = keyword.substring(0,keyword.length-1); }

                    // initialise
                    let isSubLabel: boolean = keyword.startsWith('.');
                    isContainer = !isSubLabel;
                    symbolName = keyword;
                    symbolKind = (isSubLabel ? vscode.SymbolKind.Field : vscode.SymbolKind.Method);

                    // subroutine (or other)?
                    if (keywords.length > 1 && keywords[1].toUpperCase() === 'SUBROUTINE') { symbolName += ` ${keywords[1].toLowerCase()}`; }

                    // within container?
                    if (isContainer) 
                    { 
                        while (containers.length > 0) {
                            containers.pop();
                        }
                    }

                    // set
                    isWithinLabel = true;
                    break;
            }

            // anything to add?
            if (symbolKind) {
                // initialise
                let symbol = new vscode.DocumentSymbol(
                    symbolName,
                    symbolDetail,
                    symbolKind,
                    line.range, line.range
                );

                // add to store
                if (containers.length > 0) {
                    // child
                    containers[containers.length - 1].children.push(symbol);
                }
                else {
                    // parent
                    symbols.push(symbol);
                }

                // is this a container?
                if (isContainer) { containers.push(symbol); }
            }
        }

        // return result
        return symbols;
    }
}
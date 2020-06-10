"use strict";
import * as vscode from 'vscode';

export abstract class DocumentSymbolProviderBase implements vscode.DocumentSymbolProvider {

    public readonly Id: string;

    constructor(id: string) {
        this.Id = id;
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void> {
        // Complete registration
        vscode.languages.registerDocumentSymbolProvider(this.Id, this);
    }

    // Used for both 7800basic and batariBasic

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        // prepare
        let symbols: vscode.DocumentSymbol[] = [];
        let containers: vscode.DocumentSymbol[] = [];
        let isWithinMethod = false;
        let isWithinData = false;
        let isWithinAsm = false;
        let isWithinFunctionOrMacro = false;
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

            // validation
            if (line.isEmptyOrWhitespace) { continue; }

            // get line
            let lineText: string = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);

            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords: string[] = lineText.split(/[\s\t]+/,3);
            if (keywords.length < 0) { continue; }
            let mainKeyword: string = keywords[0].toLowerCase();

            // validation - rem
            if (mainKeyword.startsWith(';') || mainKeyword.startsWith('rem')) { continue; }

            // prepare
            let symbolKind: vscode.SymbolKind | undefined = undefined;
            let isContainer: boolean = false;
            let symbolName: string = '';
            let symbolDetail: string = '';

            // Symbols
            switch (mainKeyword) {
                case 'bank':
                    // initialise
                    symbolKind = vscode.SymbolKind.Class;
                    isContainer = true;
                    isWithinMethod = false;
                    isWithinData = false;
                    isWithinAsm = false;
                    isWithinFunctionOrMacro = false;

                    // set name (append bank number)
                    symbolName = mainKeyword;
                    if (keywords[0].length > 1) { symbolName += ` ${keywords[1]}`; }

                    // reset container to root?
                    while (containers.length > 0) {
                        containers.pop();
                    }

                    break;
                case 'dim':
                    // enable this to show variables
                    //symbolName = keywords[1];
                    //symbolKind = vscode.SymbolKind.Variable;
                    //isContainer = false;
                    break;
                case 'const':
                    // enable this to show consts
                    //symbolName = keywords[1];
                    //symbolKind = vscode.SymbolKind.Constant;
                    //isContainer = false;
                    break;
                case 'data':
                case 'sdata':
                case 'alphadata':
                case 'songdata':
                case 'speechdata':
                    // set
                    isWithinData = true;
                    break;
                case 'end':
                    // careful of order here - asm can be within a function/macro
                    if (isWithinAsm) {
                        isWithinAsm = false;
                        break;
                    }
                    if (isWithinData) {
                        isWithinData = false;
                        break;
                    }
                    if (isWithinFunctionOrMacro) {
                        isWithinFunctionOrMacro = false;
                        containers.pop();
                        break;
                    }
                    break;
                case 'asm':
                    // set
                    isWithinAsm = true;
                    break;
                case 'function':
                case 'macro':
                    if (keywords.length >= 2) {
                        // initialise
                        symbolName = keywords[1];
                        // append function or macro tag
                        symbolDetail = `() ${mainKeyword}`;
                        symbolKind = vscode.SymbolKind.Function;
                        isWithinFunctionOrMacro = true;
                        isContainer = true;

                        // is in method?
                        if (isWithinMethod) {
                            containers.pop();
                            isWithinMethod = false;
                        }
                    }
                    break;
                case 'return':
                    // inside function or macro?
                    if (isWithinMethod || isWithinFunctionOrMacro) {
                        // reset
                        containers.pop();
                        isWithinMethod = false;
                        isWithinFunctionOrMacro = false;
                    }
                    break;
                case 'dmahole':
                    // do nothing for now
                    break;
                default:
                    // validate
                    // anything indented at this point does not get processed
                    if (line.text.startsWith(' ')) { continue; }
                    // is within data or asm? if so skip
                    if (isWithinData || isWithinAsm) { continue; }

                    // initialise
                    let isSubMethod: boolean = mainKeyword.startsWith('_');
                    isContainer = !isSubMethod;
                    symbolName = keywords[0];
                    // method or sub-function within method)
                    symbolKind = (isSubMethod ? vscode.SymbolKind.Field : vscode.SymbolKind.Method);
                    if (isSubMethod) { symbolDetail = 'sub'; }

                    // are we already in a method (and not a sub-method)
                    if (isContainer && (isWithinMethod || isWithinFunctionOrMacro)) { containers.pop(); }

                    // set
                    isWithinMethod = true;
                    isWithinFunctionOrMacro = false;
                    isWithinData = false;
                    isWithinAsm = false;
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
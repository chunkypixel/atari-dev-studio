"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const outlineBase_1 = require("./outlineBase");
class SeventyEightHundredBasicOutline extends outlineBase_1.OutlineBase {
    constructor() {
        super("7800basic");
    }
    provideDocumentSymbols(document, token) {
        // prepare
        let symbols = [];
        let containers = [];
        let isWithinMethod = false;
        // Scan
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // Get line
            const line = document.lineAt(lineIndex);
            // Validation
            if (line.isEmptyOrWhitespace) {
                continue;
            }
            // Extend container range
            containers.forEach(container => {
                container.range = new vscode.Range(container.selectionRange.start, line.range.end);
            });
            // Get a clean line to compare against
            const lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex)
                .replace('\t', ' ');
            if (lineText.length < 2) {
                continue;
            }
            // Break down works in line
            let keywords = lineText.split(' ');
            if (keywords.length < 0) {
                continue;
            }
            let firstWord = keywords[0].toLowerCase();
            // preapre
            let isSymbolKind = undefined;
            let isContainer = false;
            let symbolName = '';
            let symbolDetail = '';
            // Symbols
            switch (firstWord) {
                case 'bank':
                    // initialise
                    isSymbolKind = vscode.SymbolKind.Class;
                    isContainer = true;
                    isWithinMethod = false;
                    // Get name (append bank number)
                    symbolName = firstWord;
                    if (keywords[0].length > 1) {
                        symbolName += ` ${keywords[1]}`;
                    }
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
                default:
                    // initialise
                    // anything indented does not get processed in this language
                    if (line.text.startsWith(' ') || line.text.startsWith('\t')) {
                        break;
                    }
                    // prepare
                    let isSubFunction = firstWord.startsWith('_');
                    isContainer = !isSubFunction;
                    symbolName = keywords[0];
                    // method or sub-function within method)
                    isSymbolKind = (isSubFunction ? vscode.SymbolKind.Variable : vscode.SymbolKind.Function);
                    if (isSubFunction) {
                        symbolDetail = '(sub)';
                    }
                    // are we already is a method (and not a sub-method)
                    if (isContainer && isWithinMethod) {
                        containers.pop();
                    }
                    // set flag
                    isWithinMethod = true;
                    break;
            }
            // Add symbol?
            if (isSymbolKind) {
                // initialise
                let symbol = new vscode.DocumentSymbol(symbolName, symbolDetail, isSymbolKind, line.range, line.range);
                // store
                if (containers.length > 0) {
                    // child
                    containers[containers.length - 1].children.push(symbol);
                }
                else {
                    // parent
                    symbols.push(symbol);
                }
                // Store as a container?
                if (isContainer) {
                    containers.push(symbol);
                }
            }
        }
        // return result
        return symbols;
    }
}
exports.SeventyEightHundredBasicOutline = SeventyEightHundredBasicOutline;
//# sourceMappingURL=seventyEightHundredBasicOutline.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DasmDocumentSymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
const documentSymbolProviderBase_1 = require("./documentSymbolProviderBase");
class DasmDocumentSymbolProvider extends documentSymbolProviderBase_1.DocumentSymbolProviderBase {
    constructor() {
        super("dasm");
    }
    provideDocumentSymbols(document, token) {
        // prepare
        let symbols = [];
        let containers = [];
        let isWithinLabel = false;
        let isWithinMacro = false;
        let prevLine;
        // Scan
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // get
            let line = document.lineAt(lineIndex);
            // extend container range
            containers.forEach(container => {
                // note: for this work correctly (for open methods) set the range we need to set the range to the 
                // previous row not the current one
                container.range = new vscode.Range(container.selectionRange.start, prevLine.range.end);
            });
            // store (for expanding container)
            prevLine = line;
            // validate
            if (line.isEmptyOrWhitespace)
                continue;
            // get line
            let lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);
            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords = lineText.split(/[\s\t]+/, 3);
            if (keywords.length < 0)
                continue;
            let mainKeyword = keywords[0].toLowerCase();
            // validate - remark
            if (mainKeyword.startsWith(';') || mainKeyword.startsWith('*'))
                continue;
            // prepare
            let symbolKind = undefined;
            let isContainer = false;
            let symbolName = '';
            let symbolDetail = '';
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
                    if (line.text.startsWith(' ') || line.text.startsWith('\t'))
                        continue;
                    // is variable?
                    let isVariable = false;
                    if (keywords.length > 1) {
                        for (var index = 1; index < keywords.length; index++) {
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
                        if (isVariable)
                            continue;
                    }
                    // get keyword
                    let keyword = keywords[0];
                    if (keyword.endsWith(':'))
                        keyword = keyword.substring(0, keyword.length - 1);
                    // initialise
                    let isSubLabel = keyword.startsWith('.');
                    isContainer = !isSubLabel;
                    symbolName = keyword;
                    symbolKind = (isSubLabel ? vscode.SymbolKind.Field : vscode.SymbolKind.Method);
                    // subroutine (or other)?
                    if (keywords.length > 1 && keywords[1].toUpperCase() === 'SUBROUTINE')
                        symbolName += ` ${keywords[1].toLowerCase()}`;
                    // within container?
                    if (isContainer) {
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
                let symbol = new vscode.DocumentSymbol(symbolName, symbolDetail, symbolKind, line.range, line.range);
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
                if (isContainer)
                    containers.push(symbol);
            }
        }
        // return result
        return symbols;
    }
}
exports.DasmDocumentSymbolProvider = DasmDocumentSymbolProvider;
//# sourceMappingURL=dasmDocumentSymbolProvider.js.map
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
exports.DasmReferenceProvider = void 0;
const vscode = __importStar(require("vscode"));
const referenceProviderBase_1 = require("./referenceProviderBase");
class DasmReferenceProvider extends referenceProviderBase_1.ReferenceProviderBase {
    constructor() {
        super("dasm");
    }
    provideReferences(document, position, context, token) {
        // prepare
        let definitions = [];
        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return undefined;
        // get selected word
        let word = document.getText(wordRange);
        if (!word)
            return undefined;
        // process
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // validate
            let line = document.lineAt(lineIndex);
            if (line.isEmptyOrWhitespace)
                continue;
            // get line
            let lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);
            // get keywords
            let keywords = lineText.split(/[\s\t]+/);
            if (keywords.length < 0)
                continue;
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
                            char !== '/' && char !== '*' && char !== '+' && char !== '-')
                            break;
                    }
                    // position of word on line
                    let wordIndex = line.text.indexOf(keywords[keywordIndex]);
                    if (wordIndex < 0)
                        wordIndex = 0;
                    // store and exit for
                    definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, wordIndex)));
                }
            }
        }
        // return
        return definitions;
    }
}
exports.DasmReferenceProvider = DasmReferenceProvider;
//# sourceMappingURL=dasmReferenceProvider.js.map
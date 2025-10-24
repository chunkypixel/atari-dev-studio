"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceProviderBase = void 0;
const vscode = require("vscode");
class ReferenceProviderBase {
    constructor(id) {
        this.Id = id;
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Complete registration
            vscode.languages.registerReferenceProvider(this.Id, this);
        });
    }
    // Used for both 7800basic and batariBasic
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
            // get
            let line = document.lineAt(lineIndex);
            // validate
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
                    // validate length
                    if (keyword.length !== word.length) {
                        // is next character a letter? if so not a full match
                        // we need to verify this to get exact matches where line is NOT spaced between fields
                        let position = keyword.indexOf(word);
                        let char = keyword.substring(position + word.length, position + word.length + 1);
                        if (char !== '' && char !== '=' && char !== ',' && char !== ':' && char !== ';' &&
                            char !== '[' && char !== '{' && char !== '(')
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
exports.ReferenceProviderBase = ReferenceProviderBase;
//# sourceMappingURL=referenceProviderBase.js.map
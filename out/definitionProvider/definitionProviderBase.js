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
const vscode = require("vscode");
class DefinitionProviderBase {
    constructor(id) {
        this.Id = id;
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Complete registration
            vscode.languages.registerDefinitionProvider(this.Id, this);
        });
    }
    // Used for both 7800basic and batariBasic
    provideDefinition(document, position, token) {
        // prepare
        let definitions = [];
        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }
        // get selected word
        let word = document.getText(wordRange);
        if (!word) {
            return undefined;
        }
        // process
        for (var lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            // validate
            let line = document.lineAt(lineIndex);
            if (line.isEmptyOrWhitespace) {
                continue;
            }
            // get line
            let lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);
            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords = lineText.split(/[\s\t]+/, 3);
            if (keywords.length < 0) {
                continue;
            }
            let mainKeyword = keywords[0].toLowerCase();
            // Notes:
            // for methods need to be the first word (no spaces)
            // for other definitions need to be dim, const (vars), function or macros
            if (line.text.startsWith(' ')) {
                // validate
                if (mainKeyword === 'dim' || mainKeyword === 'const' || mainKeyword === 'function' || mainKeyword === 'macro' ||
                    mainKeyword.search('data') > -1) {
                    for (var keywordIndex = 0; keywordIndex < keywords.length; keywordIndex++) {
                        // Prepare
                        // remmarks may appear later in line too
                        var keyword = keywords[keywordIndex];
                        if (keyword === '=' || keyword.startsWith(';') || keyword.startsWith('rem')) {
                            break;
                        }
                        // match?
                        if (keyword.startsWith(word)) {
                            // validate length
                            if (keyword.length > word.length) {
                                // is next character a letter? if so not a full match
                                // we need to verify this to get exact matches where line is NOT spaced between fields
                                let char = keyword.substring(word.length, word.length + 1);
                                if (char !== '=' && char !== ':' && char !== '[' && char !== '{' && char !== '(') {
                                    break;
                                }
                            }
                            // position of word on line
                            let wordIndex = line.text.indexOf(keywords[keywordIndex]);
                            if (wordIndex < 0) {
                                wordIndex = 0;
                            }
                            // store and exit for
                            definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, wordIndex)));
                            break;
                        }
                    }
                }
            }
            else {
                // validate method
                if (mainKeyword === word) {
                    // store
                    definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)));
                }
            }
        }
        // return
        return definitions;
    }
}
exports.DefinitionProviderBase = DefinitionProviderBase;
//# sourceMappingURL=definitionProviderBase.js.map
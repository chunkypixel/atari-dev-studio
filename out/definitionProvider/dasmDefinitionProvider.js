"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DasmDefinitionProvider = void 0;
const vscode = require("vscode");
const definitionProviderBase_1 = require("./definitionProviderBase");
class DasmDefinitionProvider extends definitionProviderBase_1.DefinitionProviderBase {
    constructor() {
        super("dasm");
    }
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
            // get
            let line = document.lineAt(lineIndex);
            // validate
            if (line.isEmptyOrWhitespace) {
                continue;
            }
            if (line.text.startsWith(' ') || line.text.startsWith('\t')) {
                continue;
            }
            // get line
            let lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);
            // validate - remark
            if (lineText.startsWith(';') || lineText.startsWith('*')) {
                continue;
            }
            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords = lineText.split(/[\s\t]+/, 3);
            if (keywords.length < 0) {
                continue;
            }
            // Notes:
            // for labels need to be the first word (no spaces)
            // Ensure we compare actual case
            // Need to check for label tags
            if (keywords[0] === word || keywords[0].startsWith('.' + word) || keywords[0].endsWith(word + ':')) {
                // store
                definitions.push(new vscode.Location(document.uri, new vscode.Position(lineIndex, 0)));
            }
        }
        // return
        return definitions;
    }
}
exports.DasmDefinitionProvider = DasmDefinitionProvider;
//# sourceMappingURL=dasmDefinitionProvider.js.map
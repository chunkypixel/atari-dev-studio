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
exports.DasmDefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
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
            if (line.text.startsWith(' ') || line.text.startsWith('\t'))
                continue;
            // get line
            let lineText = line.text
                .slice(line.firstNonWhitespaceCharacterIndex);
            // validate - remark
            if (lineText.startsWith(';') || lineText.startsWith('*'))
                continue;
            // get keywords
            // just get the first 3 to increase speed (<mainkeyword><space><secondarykeyword>)
            let keywords = lineText.split(/[\s\t]+/, 3);
            if (keywords.length < 0)
                continue;
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

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
exports.ContextHelpBase = void 0;
const vscode = require("vscode");
const path = require("path");
const browser = require("../browser");
const filesystem = require("../filesystem");
class ContextHelpBase {
    constructor(id, url) {
        this.links = {};
        this.Id = id;
        this.Url = url;
    }
    LoadContextHelpFileAsync(context, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prepare
            const filePath = vscode.Uri.file(path.join(context.extensionPath, 'contexthelp', filename));
            // Process
            const fileArrary = (yield filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/);
            for (const line of fileArrary) {
                // split (into 2) and validate length
                var content = line.split("|");
                if (content.length != 2)
                    continue;
                // store?
                this.links[content[0].toLowerCase()] = content[1].toLowerCase();
            }
        });
    }
    OpenContextHelpAtCursorAsync(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // validate if a range is selected
            let wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange)
                return undefined;
            // get selected word
            let word = document.getText(wordRange);
            if (!word)
                return undefined;
            // Find a match
            var content = this.links[word.toLowerCase()];
            if (content) {
                // Yes got one
                var url = this.Url + '#' + content;
                yield browser.OpenUrlInBrowser(url);
            }
        });
    }
}
exports.ContextHelpBase = ContextHelpBase;
//# sourceMappingURL=contextHelpBase.js.map
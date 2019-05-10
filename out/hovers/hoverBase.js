"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
class HoverBase {
    constructor(id) {
        this.hoverText = {};
        this.Id = id;
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // In class extension call LoadHoverFile first then super back to here
            // Complete registration
            vscode.languages.registerHoverProvider(this.Id, this);
        });
    }
    //
    // Load and parse a file located in .../hovers 
    //
    // The files are plain text with the keywords in the first column
    // followed by the description indented.
    //
    // Each entry in the file is appended to the hoverText[] array to be used
    // when looking up the keyword the user is hovering over
    //
    LoadHoverFileAsync(context, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = vscode.Uri.file(path.join(context.extensionPath, 'hovers', filename));
            let arr = (yield filesystem.ReadFileAsync(filePath.fsPath)).toString().split(/\r?\n/);
            let txt = '';
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].length > 0 && arr[i].charAt(0) > ' ') {
                    if (txt.length > 0) {
                        let key = '';
                        let p = 0;
                        while (txt.charAt(p) > ' ')
                            key += txt.charAt(p++);
                        this.hoverText[key] = txt.trim();
                        txt = '';
                    }
                }
                txt += arr[i] + '\r\n';
            }
        });
    }
    provideHover(document, position, token) {
        const validchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
        let word = '';
        let p = position.character;
        const line = String(document.lineAt(position.line).text);
        // Find beginning of the hower-word
        while (p > 0 && validchars.indexOf(line[p]) != -1)
            p--;
        // Skip leading invalid character
        if (validchars.indexOf(line[p]) == -1)
            p++;
        // Collect string until an invalid charecter is encountered
        while (p < line.length && validchars.indexOf(line[p]) != -1)
            word += line[p++];
        return new vscode.Hover(this.hoverText[word.toUpperCase()]);
    }
}
exports.HoverBase = HoverBase;
//# sourceMappingURL=hoverBase.js.map
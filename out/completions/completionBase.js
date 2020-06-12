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
exports.CompletionBase = void 0;
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
class CompletionBase {
    constructor(id) {
        this.Id = id;
    }
    //
    // Load and parse a file located in .../completions 
    //
    // The files are in markdown format with the keywords on each line
    //
    LoadCompletionFileAsync(context, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // prepare
            const filePath = vscode.Uri.file(path.join(context.extensionPath, 'completions', filename));
            const fileArrary = (yield filesystem.ReadFileAsync(filePath.fsPath)).toString().split(/\r?\n/);
            let autoCompletes = [];
            // process
            fileArrary.forEach((element) => {
                if (element !== undefined) {
                    autoCompletes.push(new vscode.CompletionItem(element, vscode.CompletionItemKind.Keyword));
                }
            });
            // return
            return autoCompletes;
        });
    }
}
exports.CompletionBase = CompletionBase;
//# sourceMappingURL=completionBase.js.map
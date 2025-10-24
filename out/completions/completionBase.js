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
const application = require("../application");
const filesystem = require("../filesystem");
const configuration = require("../configuration");
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
            const autoCompletes = [];
            // process
            const fileArrary = (yield filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/);
            fileArrary.forEach((element) => {
                if (element !== undefined)
                    autoCompletes.push(new vscode.CompletionItem(element, vscode.CompletionItemKind.Keyword));
            });
            // return
            return autoCompletes;
        });
    }
    RegisterGenericProviders(id, context) {
        // tv
        const tvProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
            // return list of available language methods
            provideCompletionItems(document, position) {
                // get all text until the `position` and check if it reads `return `
                let linePrefix = document.lineAt(position).text.substring(0, position.character);
                if (!linePrefix.endsWith('tv ')) {
                    return undefined;
                }
                return [
                    new vscode.CompletionItem('ntsc', vscode.CompletionItemKind.Enum),
                    new vscode.CompletionItem('pal', vscode.CompletionItemKind.Enum)
                ];
            }
        }, ' ');
        context.subscriptions.push(tvProvider);
    }
    RegisterGenericDirectiveProviders(id, context) {
        // Tags
        const adsDirectiveProvider = vscode.languages.registerCompletionItemProvider(id, {
            // return list of available language methods
            provideCompletionItems(document, position) {
                // get all text until the `position` and check if it reads `return `
                let linePrefix = document.lineAt(position).text.substring(0, position.character);
                // Language
                if (linePrefix.endsWith('ADSLanguage=')) {
                    // Prepare
                    const items = [];
                    // Create
                    // NOTE: sortText ensures an expected order rather than alphabetical
                    let seventyEightHundredBasicCompletion = new vscode.CompletionItem(application.SeventyEightHundredBasicLanguageId, vscode.CompletionItemKind.Enum);
                    seventyEightHundredBasicCompletion.sortText = "";
                    let batariBasicCompletion = new vscode.CompletionItem(application.BatariBasicLanguageId, vscode.CompletionItemKind.Enum);
                    batariBasicCompletion.sortText = "b";
                    let makeCompletion = new vscode.CompletionItem("make", vscode.CompletionItemKind.Enum);
                    makeCompletion.sortText = "c";
                    items.push(seventyEightHundredBasicCompletion, batariBasicCompletion, makeCompletion);
                    return items;
                }
                // Compiler
                if (linePrefix.endsWith('ADSCompiler=')) {
                    // Prepare
                    const items = [];
                    // Get list configured by user
                    const existingList = configuration.GetCustomCompilerIdList(id);
                    // Create
                    // NOTE: sortText ensures an expected order rather than alphabetical
                    let defaultCompletion = new vscode.CompletionItem("Default", vscode.CompletionItemKind.Enum);
                    defaultCompletion.sortText = "a";
                    items.push(defaultCompletion);
                    existingList.forEach(id => {
                        items.push(new vscode.CompletionItem(id, vscode.CompletionItemKind.Enum));
                    });
                    return items;
                }
                // Nothing
                return undefined;
            }
        }, ' ', '=');
        context.subscriptions.push(adsDirectiveProvider);
        // Directives
        const directivesProvider = vscode.languages.registerCompletionItemProvider(id, {
            provideCompletionItems(document, position) {
                // get all text until the `position` and check if it reads `return `
                let linePrefix = document.lineAt(position).text.substring(0, position.character);
                // Items
                if (linePrefix.endsWith(';#')) {
                    // Prepare
                    const items = [];
                    // Create
                    items.push(new vscode.CompletionItem("ADSLanguage", vscode.CompletionItemKind.Enum));
                    items.push(new vscode.CompletionItem("ADSCompiler", vscode.CompletionItemKind.Enum));
                    items.push(new vscode.CompletionItem("region", vscode.CompletionItemKind.Enum));
                    items.push(new vscode.CompletionItem("endregion", vscode.CompletionItemKind.Enum));
                    return items;
                }
                // Nothing
                return undefined;
            }
        }, '#');
        context.subscriptions.push(directivesProvider);
    }
}
exports.CompletionBase = CompletionBase;
//# sourceMappingURL=completionBase.js.map
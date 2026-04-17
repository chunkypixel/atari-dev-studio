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
exports.CompletionBase = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const application = __importStar(require("../application"));
const filesystem = __importStar(require("../filesystem"));
const configuration = __importStar(require("../configuration"));
class CompletionBase {
    constructor(id) {
        this.Id = id;
    }
    //
    // Load and parse a file located in .../completions 
    //
    // The files are in markdown format with the keywords on each line
    //
    async LoadCompletionFileAsync(context, filename) {
        // prepare
        const filePath = vscode.Uri.file(path.join(context.extensionPath, 'completions', filename));
        const autoCompletes = [];
        // process
        const fileArrary = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/);
        fileArrary.forEach((element) => {
            if (element !== undefined)
                autoCompletes.push(new vscode.CompletionItem(element, vscode.CompletionItemKind.Keyword));
        });
        // return
        return autoCompletes;
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
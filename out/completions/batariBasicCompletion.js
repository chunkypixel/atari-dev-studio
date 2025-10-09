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
exports.BatariBasicCompletion = void 0;
const vscode = require("vscode");
const completionBase_1 = require("./completionBase");
class BatariBasicCompletion extends completionBase_1.CompletionBase {
    //private _keywords: vscode.CompletionItem[] = [];
    constructor() {
        super("batariBasic");
    }
    RegisterAsync(context) {
        const _super = Object.create(null, {
            RegisterGenericDirectiveProviders: { get: () => super.RegisterGenericDirectiveProviders },
            RegisterGenericProviders: { get: () => super.RegisterGenericProviders }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // system
            _super.RegisterGenericDirectiveProviders.call(this, this.Id, context);
            _super.RegisterGenericProviders.call(this, this.Id, context);
            // return
            const returnProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('return ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('thisbank', vscode.CompletionItemKind.Keyword),
                        new vscode.CompletionItem('otherbank', vscode.CompletionItemKind.Keyword)
                    ];
                }
            }, ' ');
            context.subscriptions.push(returnProvider);
            // romsize
            const romsizeProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('romsize ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('2k', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('4K', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('8k', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('16k', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('32k', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('64k', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('8kSC', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('16kSC', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('32kSC', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('64kSC', vscode.CompletionItemKind.Enum)
                    ];
                }
            }, ' ');
            context.subscriptions.push(romsizeProvider);
            // set
            const setProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('set ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('smartbranching', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('tv', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('romsize', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('optimisation', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('kernel', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('kernel_options', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('debug', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('legacy', vscode.CompletionItemKind.Enum)
                    ];
                }
            }, ' ');
            context.subscriptions.push(setProvider);
            // optimization
            const optimizationProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('optimization ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('speed', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('size', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('noinlinedata', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('inlinerand', vscode.CompletionItemKind.Enum)
                    ];
                }
            }, ' ');
            context.subscriptions.push(optimizationProvider);
            // kernel
            const kernelProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('kernel ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('multisprite', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('DPC+', vscode.CompletionItemKind.Enum)
                    ];
                }
            }, ' ');
            context.subscriptions.push(kernelProvider);
            // debug
            const debugProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('debug ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('cycles', vscode.CompletionItemKind.Enum),
                        new vscode.CompletionItem('cyclescore', vscode.CompletionItemKind.Enum)
                    ];
                }
            }, ' ');
            context.subscriptions.push(debugProvider);
            // legacy
            const legacyProvider = vscode.languages.registerCompletionItemProvider(this.Id, {
                // return list of available language methods
                provideCompletionItems(document, position) {
                    // get all text until the `position` and check if it reads `return `
                    let linePrefix = document.lineAt(position).text.substring(0, position.character);
                    if (!linePrefix.endsWith('legacy ')) {
                        return undefined;
                    }
                    return [
                        new vscode.CompletionItem('0.99', vscode.CompletionItemKind.Enum)
                    ];
                }
            }, ' ');
            context.subscriptions.push(legacyProvider);
        });
    }
}
exports.BatariBasicCompletion = BatariBasicCompletion;
//# sourceMappingURL=batariBasicCompletion.js.map
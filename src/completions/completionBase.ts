"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';
import * as configuration from '../configuration';

export abstract class CompletionBase {

    public readonly Id:string;

    constructor(id:string) {
        this.Id = id;
    }

    public abstract RegisterAsync(context: vscode.ExtensionContext): Promise<void>;

	//
	// Load and parse a file located in .../completions 
	//
	// The files are in markdown format with the keywords on each line
	//
	protected async LoadCompletionFileAsync(context: vscode.ExtensionContext, filename: string): Promise<vscode.CompletionItem[]> {
        // prepare
        const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'completions', filename));
        const fileArrary = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).toString().split(/\r?\n/);
        const autoCompletes: vscode.CompletionItem[] = [];

        // process
        fileArrary.forEach((element: string) => {
            if (element !== undefined) { autoCompletes.push(new vscode.CompletionItem(element,vscode.CompletionItemKind.Keyword)); }
        });

        // return
        return autoCompletes;
	}

    protected RegisterGenericProviders(id: string, context: vscode.ExtensionContext): void {
        // tv
        const tvProvider = vscode.languages.registerCompletionItemProvider(
        this.Id,
        {
            // return list of available language methods
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
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
        },
        ' ');
        context.subscriptions.push(tvProvider);

    }

    protected RegisterGenericDirectiveProviders(id: string, context: vscode.ExtensionContext): void {
        // Tags
        const adsDirectiveProvider = vscode.languages.registerCompletionItemProvider(
        id,
        {
            // return list of available language methods
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                // get all text until the `position` and check if it reads `return `
                let linePrefix = document.lineAt(position).text.substring(0, position.character);

                // Language
                if (linePrefix.endsWith('ADSLanguage=')) {
                    // Prepare
                    const items: vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> = [];
                    // Create
                    // NOTE: sortText ensures an expected order rather than alphabetical
                    let seventyEightHundredBasicCompletion = new vscode.CompletionItem("7800basic", vscode.CompletionItemKind.Enum);
                    seventyEightHundredBasicCompletion.sortText = "";
                    let batariBasicCompletion = new vscode.CompletionItem("batariBasic", vscode.CompletionItemKind.Enum);
                    batariBasicCompletion.sortText = "b";
                    let makeCompletion = new vscode.CompletionItem("make", vscode.CompletionItemKind.Enum);
                    makeCompletion.sortText = "c";
                    items.push(seventyEightHundredBasicCompletion,batariBasicCompletion,makeCompletion)
                    return items;
                }

                // Compiler
                if (linePrefix.endsWith('ADSCompiler=')) {
                    // Prepare
                    const items: vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> = [];
                    // Get list configured by user
                    const existingList = configuration.GetCustomCompilerIdList(id);
                    // Create
                    // NOTE: sortText ensures an expected order rather than alphabetical
                    let defaultCompletion = new vscode.CompletionItem("Default", vscode.CompletionItemKind.Enum);
                    defaultCompletion.sortText = "a";
                    items.push(defaultCompletion);
                    existingList.forEach(id => {
                        items.push(new vscode.CompletionItem(id, vscode.CompletionItemKind.Enum))
                    });
                    return items;
                }
                
                // Nothing
                return undefined;
            }
        },
        ' ','=');
        context.subscriptions.push(adsDirectiveProvider);

        // Directives
        const directivesProvider = vscode.languages.registerCompletionItemProvider(
        id,
        {     
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                // get all text until the `position` and check if it reads `return `
                let linePrefix = document.lineAt(position).text.substring(0, position.character);

                // Items
                if (linePrefix.endsWith(';#')) {
                    // Prepare
                    const items: vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> = [];
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
        },
        '#');
        context.subscriptions.push(directivesProvider);

    }
  
}
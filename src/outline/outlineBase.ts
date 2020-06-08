"use strict";
import * as vscode from 'vscode';

export abstract class OutlineBase implements vscode.DocumentSymbolProvider {

    public readonly Id:string;

    constructor(id:string) {
        this.Id = id;
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void>
    {
        // Complete registration
        vscode.languages.registerDocumentSymbolProvider(this.Id, this);
    }

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        throw new Error("Method not implemented.");
    }

}
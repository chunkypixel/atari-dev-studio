"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';
import * as browser from "../browser";

export class SamplesPage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext) {
        console.log('debugger:SamplesPage.openPage');

        // Prepare
        let contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'samples'));
        let columnToShowIn = vscode.window.activeTextEditor
                                ? vscode.window.activeTextEditor.viewColumn
                                : undefined;
        const cardItems = await getLanguageContent(contentUri);
        let isOpen = false;

        // Open or create panel?
        if (this.currentPanel) {
            // Open
            this.currentPanel.reveal(columnToShowIn);
            isOpen = true;

        } else {
            // Create
            this.currentPanel = vscode.window.createWebviewPanel(
                'webpage',
                'Atari Dev Studio Language Samples',
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [contentUri], 
                }
            );

            // Content
            let samplesPagePath = vscode.Uri.joinPath(contentUri,'index.html');
            let content = await filesystem.ReadFileAsync(samplesPagePath.fsPath,'utf-8');
            const nonce = browser.GenerateNonce();
            // Script
            const scriptJsPath = vscode.Uri.joinPath(contentUri,'bootstrap.bundle.min.js');
            const scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
            // Style
            const styleCssPath = vscode.Uri.joinPath(contentUri,'bootstrap.min.css');
            const styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
            // Tags
            content = content
                .replace(/\${nonce}/g, nonce)
                .replace(/\${cspSource}/g, this.currentPanel.webview.cspSource)
                .replace(/\${scriptJsUri}/g, scriptJsUri)
                .replace(/\${styleCssUri}/g, styleCssUri);

            // Language content
            const cardContent = cardItems.map((card, index) => getCardTemplate(card, index)).join('');
            content = content.replace(/\${cardContent}/g, cardContent)

            // Display
            this.currentPanel.webview.html = content;  
        }

        // Handle messages from the WebView
        this.currentPanel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'viewButtonClicked') {
                    // Get button index and open
                    const cardIndex = parseInt(message.id, 10);
                    await openSampleInFolder(context, cardItems[cardIndex]);
                }
            }
        );

    }
}

// Interface to define the structure of the JSON data
interface CardItem {
    Title: string;
    Image: string;
    Description: string;
    Folder: string;
    File: string;
    Language: string;
}

async function getLanguageContent(contentUri: vscode.Uri): Promise<CardItem[]> {
    // prepare
    const languageContentPath = vscode.Uri.joinPath(contentUri,'content.json');
    const content = await filesystem.ReadFileAsync(languageContentPath.fsPath, 'utf-8');
    // process and return result
    if (content) return JSON.parse(content) as CardItem[];
    return [];
}

async function openSampleInFolder(context: vscode.ExtensionContext, item: CardItem): Promise<void> {
    // Open the folder as the only workspace folder (force new window to replace existing)
    const folderUri = vscode.Uri.file(path.join(context.extensionPath, item.Folder));
    await vscode.commands.executeCommand('vscode.openFolder', folderUri, { forceNewWindow: false, forceReuseWindow: true });
}

function getCardTemplate(card: CardItem, index: number): string {
  return `                    
        <div class="col">
            <h2 class="card-title">${card.Title}</h2>
            <div class="card shadow-sm">
                <img src="${card.Image}${index}" class="card-img-top" alt="Thumbnail">
                <div class="card-body">
                    <p class="card-text">
                        ${card.Description}
                    </p>
                    <div class="d-flex justify-content-between align-items-center"> 
                        <div class="btn-group">
                            <a class="btn btn-sm btn-outline-primary btn-view" data-id="${index}">Open</a>
                        </div>
                        <small class="text-body-secondary">${card.Language}</small>
                    </div>
                </div>
            </div>
        </div>
    `;     
}
"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as application from '../application';
import * as configuration from '../configuration';
import * as filesystem from '../filesystem';
import * as browser from "../browser";

export class LearningCenterPage implements vscode.Disposable {

    public currentPanel: vscode.WebviewPanel | undefined = undefined;

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext) {
        console.log('debugger:LearningCenterPage.openPage');

        // Prepare
        let contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'learningcenter'));
        let columnToShowIn = vscode.window.activeTextEditor
                                ? vscode.window.activeTextEditor.viewColumn
                                : undefined;
        const cardItems = await this.getSampleContent(contentUri);
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
                'Atari Dev Studio Learning Center',
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [contentUri], 
                }
            );

            // Content
            let learningCenterPagePath = vscode.Uri.joinPath(contentUri,'index.html');
            const nonce = browser.GenerateNonce();
            // Script
            const scriptJsPath = vscode.Uri.joinPath(contentUri,'bootstrap.bundle.min.js');
            const scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
            // Style
            const styleCssPath = vscode.Uri.joinPath(contentUri,'bootstrap.min.css');
            const styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
            // Tags
            let content = await filesystem.ReadFileAsync(learningCenterPagePath.fsPath,'utf-8');
            content = content
                .replace(/\${nonce}/g, nonce)
                .replace(/\${cspSource}/g, this.currentPanel.webview.cspSource)
                .replace(/\${scriptJsUri}/g, scriptJsUri)
                .replace(/\${styleCssUri}/g, styleCssUri);

            // Language content
            const cardContent = cardItems.map((card: CardItem, index: number) => this.getCardTemplate(contentUri, card, index)).join('');
            content = content.replace(/\${cardContent}/g, cardContent)

            // Display
            this.currentPanel.webview.html = content;  
        }

        // Handle messages from the WebView
        this.currentPanel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'viewButtonClicked') {
                    // Process
                    switch (message.id) {
                        case application.SeventyEightHundredBasicLanguageId:
                        case application.BatariBasicLanguageId:
                            // Open language root folder
                            await this.openSampleFolder(vscode.Uri.joinPath(contentUri, 'samples', message.id));
                            break;
                        
                        default:
                            // Get button index and open language sample folder
                            const cardItem = cardItems[parseInt(message.id, 10)];
                            if (cardItem) {
                                // Prepare
                                const sampleFolderUri = vscode.Uri.joinPath(contentUri, 'samples', cardItem.Folder);
                                const sampleFileToOpenUrl = cardItem.File ? vscode.Uri.joinPath(sampleFolderUri, cardItem.File) : undefined;

                                // Do we also want to open a file once the workspace is loaded?
                                // NOTE: as the entire workspace reloads we load file and set language
                                if (sampleFileToOpenUrl) await context.globalState.update(`${application.Name}.configuration.openSampleFileOnRestart`, sampleFileToOpenUrl.path);

                                // Open folder in Workspace
                                await this.openSampleFolder(sampleFolderUri);
                            }
                            break;
                    }
                }
            }
        );

        // Capture dispose
        this.currentPanel.onDidDispose(
            () => {
                this.currentPanel = undefined;
            },
            null
        );
    }

    private getCardTemplate(contentUri: vscode.Uri, card: CardItem, index: number): string {
        return `                    
            <div class="col">
                <h2 class="card-title">${card.Title}</h2>
                <div class="card shadow-sm">
                    <img src="${this.currentPanel?.webview.asWebviewUri(vscode.Uri.joinPath(contentUri, card.Image))}" class="card-img-top" alt="Thumbnail">
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

    private async getSampleContent(contentUri: vscode.Uri): Promise<CardItem[]> {
        // prepare
        const languageContentPath = vscode.Uri.joinPath(contentUri,'samples.json');
        const content = await filesystem.ReadFileAsync(languageContentPath.fsPath, 'utf-8');
        // process and return result
        if (content) return JSON.parse(content) as CardItem[];
        return [];
    }

    private async openSampleFolder(contentUri: vscode.Uri): Promise<void> {
        // Open the sample folder (root or sub) as the only workspace folder (force new window to replace existing)
        await vscode.commands.executeCommand('vscode.openFolder', contentUri, { forceNewWindow: false, forceReuseWindow: true });
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
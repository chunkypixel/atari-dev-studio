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
exports.SamplesPage = void 0;
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
const browser = require("../browser");
class SamplesPage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    openPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SamplesPage.openPage');
            // Prepare
            let contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'samples'));
            let columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;
            const cardItems = yield getLanguageContent(contentUri);
            let isOpen = false;
            // Open or create panel?
            if (this.currentPanel) {
                // Open
                this.currentPanel.reveal(columnToShowIn);
                isOpen = true;
            }
            else {
                // Create
                this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Atari Dev Studio Language Samples', columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [contentUri],
                });
                // Content
                let samplesPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
                let content = yield filesystem.ReadFileAsync(samplesPagePath.fsPath, 'utf-8');
                const nonce = browser.GenerateNonce();
                // Script
                const scriptJsPath = vscode.Uri.joinPath(contentUri, 'bootstrap.bundle.min.js');
                const scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
                // Style
                const styleCssPath = vscode.Uri.joinPath(contentUri, 'bootstrap.min.css');
                const styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
                // Tags
                content = content
                    .replace(/\${nonce}/g, nonce)
                    .replace(/\${cspSource}/g, this.currentPanel.webview.cspSource)
                    .replace(/\${scriptJsUri}/g, scriptJsUri)
                    .replace(/\${styleCssUri}/g, styleCssUri);
                // Language content
                const cardContent = cardItems.map((card, index) => getCardTemplate(card, index)).join('');
                content = content.replace(/\${cardContent}/g, cardContent);
                // Display
                this.currentPanel.webview.html = content;
            }
            // Handle messages from the WebView
            this.currentPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                if (message.command === 'viewButtonClicked') {
                    // Get button index and open
                    const cardIndex = parseInt(message.id, 10);
                    yield openSampleInFolder(context, cardItems[cardIndex]);
                }
            }));
        });
    }
}
exports.SamplesPage = SamplesPage;
function getLanguageContent(contentUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // prepare
        const languageContentPath = vscode.Uri.joinPath(contentUri, 'content.json');
        const content = yield filesystem.ReadFileAsync(languageContentPath.fsPath, 'utf-8');
        // process and return result
        if (content)
            return JSON.parse(content);
        return [];
    });
}
function openSampleInFolder(context, item) {
    return __awaiter(this, void 0, void 0, function* () {
        // Open the folder as the only workspace folder (force new window to replace existing)
        const folderUri = vscode.Uri.file(path.join(context.extensionPath, item.Folder));
        yield vscode.commands.executeCommand('vscode.openFolder', folderUri, { forceNewWindow: false, forceReuseWindow: true });
    });
}
function getCardTemplate(card, index) {
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
//# sourceMappingURL=samples.js.map
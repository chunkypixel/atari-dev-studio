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
exports.LearningCenterPage = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const application = __importStar(require("../application"));
const filesystem = __importStar(require("../filesystem"));
const browser = __importStar(require("../browser"));
class LearningCenterPage {
    currentPanel = undefined;
    dispose() {
    }
    async openPage(context) {
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
        }
        else {
            // Create
            this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Atari Dev Studio Learning Center', columnToShowIn || vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [contentUri],
            });
            // Content
            let learningCenterPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
            const nonce = browser.GenerateNonce();
            // Script
            const scriptJsPath = vscode.Uri.joinPath(contentUri, 'bootstrap.bundle.min.js');
            const scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
            // Style
            const styleCssPath = vscode.Uri.joinPath(contentUri, 'bootstrap.min.css');
            const styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
            // Tags
            let content = await filesystem.ReadFileAsync(learningCenterPagePath.fsPath, 'utf-8');
            content = content
                .replace(/\${nonce}/g, nonce)
                .replace(/\${cspSource}/g, this.currentPanel.webview.cspSource)
                .replace(/\${scriptJsUri}/g, scriptJsUri)
                .replace(/\${styleCssUri}/g, styleCssUri);
            // Language content
            const batariBasicCardContent = cardItems.filter(item => item.Language === application.BatariBasicLanguageId).map((card) => this.getCardTemplate(contentUri, card)).join('');
            content = content.replace(/\${batariBasicCardContent}/g, batariBasicCardContent);
            const seventyEightHundredBasicCardContent = cardItems.filter(item => item.Language === application.SeventyEightHundredBasicLanguageId).map((card) => this.getCardTemplate(contentUri, card)).join('');
            content = content.replace(/\${7800basicCardContent}/g, seventyEightHundredBasicCardContent);
            // Display
            this.currentPanel.webview.html = content;
        }
        // Handle messages from the WebView
        this.currentPanel.webview.onDidReceiveMessage(async (message) => {
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
                            if (sampleFileToOpenUrl)
                                await context.globalState.update(`${application.Name}.configuration.openSampleFileOnRestart`, sampleFileToOpenUrl.path);
                            // Open folder in Workspace
                            await this.openSampleFolder(sampleFolderUri);
                        }
                        break;
                }
            }
        });
        // Capture dispose
        this.currentPanel.onDidDispose(() => {
            this.currentPanel = undefined;
        }, null);
    }
    getCardTemplate(contentUri, card) {
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
                                <a class="btn btn-sm btn-outline-primary btn-view" data-id="${card.Index}">Open</a>
                            </div>
                            <small class="text-body-secondary">${card.Language}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    async getSampleContent(contentUri) {
        // prepare
        const languageContentPath = vscode.Uri.joinPath(contentUri, 'samples.json');
        const content = await filesystem.ReadFileAsync(languageContentPath.fsPath, 'utf-8');
        // process and return result
        if (content)
            return JSON.parse(content).map((item, Index) => ({
                ...item,
                Index,
            }));
        // Nothing
        return [];
    }
    async openSampleFolder(contentUri) {
        // Open the sample folder (root or sub) as the only workspace folder (force new window to replace existing)
        await vscode.commands.executeCommand('vscode.openFolder', contentUri, { forceNewWindow: false, forceReuseWindow: true });
    }
}
exports.LearningCenterPage = LearningCenterPage;

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
exports.LearningCenterPage = void 0;
const vscode = require("vscode");
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const browser = require("../browser");
class LearningCenterPage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    openPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:LearningCenterPage.openPage');
            // Prepare
            let contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'learningcenter'));
            let columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;
            const cardItems = yield this.getSampleContent(contentUri);
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
                let content = yield filesystem.ReadFileAsync(learningCenterPagePath.fsPath, 'utf-8');
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
            this.currentPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                if (message.command === 'viewButtonClicked') {
                    // Process
                    switch (message.id) {
                        case application.SeventyEightHundredBasicLanguageId:
                        case application.BatariBasicLanguageId:
                            // Open language root folder
                            yield this.openSampleFolder(vscode.Uri.joinPath(contentUri, 'samples', message.id));
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
                                    yield context.globalState.update(`${application.Name}.configuration.openSampleFileOnRestart`, sampleFileToOpenUrl.path);
                                // Open folder in Workspace
                                yield this.openSampleFolder(sampleFolderUri);
                            }
                            break;
                    }
                }
            }));
            // Capture dispose
            this.currentPanel.onDidDispose(() => {
                this.currentPanel = undefined;
            }, null);
        });
    }
    getCardTemplate(contentUri, card) {
        var _a;
        return `                    
            <div class="col">
                <h2 class="card-title">${card.Title}</h2>
                <div class="card shadow-sm">
                    <img src="${(_a = this.currentPanel) === null || _a === void 0 ? void 0 : _a.webview.asWebviewUri(vscode.Uri.joinPath(contentUri, card.Image))}" class="card-img-top" alt="Thumbnail">
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
    getSampleContent(contentUri) {
        return __awaiter(this, void 0, void 0, function* () {
            // prepare
            const languageContentPath = vscode.Uri.joinPath(contentUri, 'samples.json');
            const content = yield filesystem.ReadFileAsync(languageContentPath.fsPath, 'utf-8');
            // process and return result
            if (content)
                return JSON.parse(content).map((item, Index) => (Object.assign(Object.assign({}, item), { Index })));
            // Nothing
            return [];
        });
    }
    openSampleFolder(contentUri) {
        return __awaiter(this, void 0, void 0, function* () {
            // Open the sample folder (root or sub) as the only workspace folder (force new window to replace existing)
            yield vscode.commands.executeCommand('vscode.openFolder', contentUri, { forceNewWindow: false, forceReuseWindow: true });
        });
    }
}
exports.LearningCenterPage = LearningCenterPage;
//# sourceMappingURL=learningcenter.js.map
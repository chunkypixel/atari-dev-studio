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
exports.WelcomePage = void 0;
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
const application = require("../application");
class WelcomePage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    openPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:WelcomePage.openPage');
            // Prepare
            let contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'welcome'));
            let columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;
            // Open or create panel?
            if (this.currentPanel) {
                // Open
                this.currentPanel.reveal(columnToShowIn);
            }
            else {
                // Create
                this.currentPanel = vscode.window.createWebviewPanel('webpage', `${application.DisplayName}`, columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    localResourceRoots: [contentUri]
                });
                // Content
                let startPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
                let content = yield filesystem.ReadFileAsync(startPagePath.fsPath, 'utf-8');
                let nonce = this.getNonce();
                // Script
                let scriptJsPath = vscode.Uri.joinPath(contentUri, 'script.js');
                let scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
                // Style
                let styleCssPath = vscode.Uri.joinPath(contentUri, 'style.css');
                let styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
                // Update tags in content
                content = this.replaceContentTag(content, "APPDISPLAYNAME", application.DisplayName);
                content = this.replaceContentTag(content, "APPDESCRIPTION", application.Description);
                content = this.replaceContentTag(content, "APPVERSION", application.Version);
                content = this.replaceContentTag(content, "NONCE", nonce);
                content = this.replaceContentTag(content, "CSPSOURCE", this.currentPanel.webview.cspSource);
                content = this.replaceContentTag(content, "BASEPATHURI", contentUri.path + "/");
                content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
                content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
                // Set
                this.currentPanel.webview.html = content;
            }
            // Capture command messages
            this.currentPanel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'openNewFile':
                        this.openNewFileDocument(application.BatariBasicLanguageId);
                        return;
                    case 'openFolder':
                        const options = {
                            canSelectFolders: true,
                            canSelectMany: false,
                            openLabel: 'Open Folder'
                        };
                        vscode.window.showOpenDialog(options).then((folderUri) => __awaiter(this, void 0, void 0, function* () {
                            if (folderUri && folderUri[0]) {
                                console.log(`- OpenFolder: ${folderUri[0].fsPath}`);
                                yield vscode.commands.executeCommand('vscode.openFolder', folderUri[0], false);
                            }
                        }));
                        return;
                    case 'openBatariGuidePage':
                        this.openBatariGuidePage();
                        return;
                    case 'open7800basicGuidePage':
                        this.open7800basicGuidePage();
                        return;
                    case 'openBatariBasicForum':
                        this.openBatariBasicForum();
                        return;
                    case 'open7800ProgrammingForum':
                        this.open7800ProgrammingForum();
                        return;
                    case 'openDiscussionPage':
                        this.openDiscussionPage();
                        return;
                    case 'openGitHubIssue':
                        this.openGitHubIssue();
                        return;
                }
                // Unknown
                console.log(`debugger:WelcomePage: Unknown command called: ${message.command}`);
            });
            // Capture dispose
            this.currentPanel.onDidDispose(() => {
                this.currentPanel = undefined;
            }, null);
        });
    }
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    replaceContentTag(content, tag, tagContent) {
        tag = `%${tag}%`;
        return content.replace(new RegExp(tag, 'g'), tagContent);
    }
    openNewFileDocument(language, content = '') {
        vscode.workspace.openTextDocument({ language: `${language}`, content: content }).then(doc => {
            // Open
            vscode.window.showTextDocument(doc);
        });
    }
    openBatariBasicForum() {
        console.log('debugger:WelcomePage.openBatariBasicForum');
        application.OpenBrowserWindow("http://atariage.com/forums/forum/65-batari-basic/");
    }
    open7800ProgrammingForum() {
        console.log('debugger:WelcomePage.open7800ProgrammingForum');
        application.OpenBrowserWindow("http://atariage.com/forums/forum/52-atari-7800-programming/");
    }
    openBatariGuidePage() {
        console.log('debugger:WelcomePage.openBatariGuidePage');
        application.OpenBrowserWindow("http://www.randomterrain.com/atari-2600-memories-batari-basic-commands.html");
    }
    open7800basicGuidePage() {
        console.log('debugger:WelcomePage.open7800basicGuidePage');
        application.OpenBrowserWindow("http://www.randomterrain.com/7800basic.html");
    }
    openDiscussionPage() {
        console.log('debugger:WelcomePage.openDiscussionPage');
        application.OpenBrowserWindow("http://atariage.com/forums/topic/290365-atari-dev-studio-for-homebrew-development-release/");
    }
    openGitHubIssue() {
        console.log('debugger:WelcomePage.openGitHubIssue');
        application.OpenBrowserWindow("https://github.com/chunkypixel/atari-dev-studio/issues");
    }
}
exports.WelcomePage = WelcomePage;
//# sourceMappingURL=welcome.js.map
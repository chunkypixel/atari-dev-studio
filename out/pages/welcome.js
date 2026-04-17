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
exports.WelcomePage = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const filesystem = __importStar(require("../filesystem"));
const application = __importStar(require("../application"));
const browser = __importStar(require("../browser"));
class WelcomePage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    async openPage(context) {
        console.log('debugger:WelcomePage.openPage');
        // Prepare
        const contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'welcome'));
        const columnToShowIn = vscode.window.activeTextEditor
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
            const startPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
            const nonce = browser.GenerateNonce();
            // Script
            const scriptJsPath = vscode.Uri.joinPath(contentUri, 'script.js');
            const scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
            // Style
            const styleCssPath = vscode.Uri.joinPath(contentUri, 'style.css');
            const styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
            // Update tags in content
            let content = await filesystem.ReadFileAsync(startPagePath.fsPath, 'utf-8');
            content = this.replaceContentTag(content, "APPDISPLAYNAME", application.DisplayName);
            content = this.replaceContentTag(content, "APPDESCRIPTION", application.Description);
            content = this.replaceContentTag(content, "APPVERSION", application.Version);
            content = this.replaceContentTag(content, "NONCE", nonce);
            content = this.replaceContentTag(content, "CSPSOURCE", this.currentPanel.webview.cspSource);
            content = this.replaceContentTag(content, "BASEPATHURI", contentUri.path + "/");
            content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
            content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
            // Display
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
                    vscode.window.showOpenDialog(options).then(async (folderUri) => {
                        if (folderUri && folderUri[0]) {
                            console.log(`- OpenFolder: ${folderUri[0].fsPath}`);
                            await vscode.commands.executeCommand('vscode.openFolder', folderUri[0], false);
                        }
                    });
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
    }
    replaceContentTag(content, tag, tagContent) {
        tag = `%${tag}%`;
        return content.replace(new RegExp(tag, 'g'), tagContent);
    }
    openNewFileDocument(language, content = '') {
        vscode.workspace.openTextDocument({ language: `${language}`, content: content })
            .then((document) => vscode.window.showTextDocument(document, { preview: false, preserveFocus: true }));
    }
    openBatariBasicForum() {
        console.log('debugger:WelcomePage.openBatariBasicForum');
        browser.OpenUrlInBrowser('http://atariage.com/forums/forum/65-batari-basic/');
    }
    open7800ProgrammingForum() {
        console.log('debugger:WelcomePage.open7800ProgrammingForum');
        browser.OpenUrlInBrowser('http://atariage.com/forums/forum/52-atari-7800-programming/');
    }
    openBatariGuidePage() {
        console.log('debugger:WelcomePage.openBatariGuidePage');
        browser.OpenUrlInBrowser('http://www.randomterrain.com/atari-2600-memories-batari-basic-commands.html');
    }
    open7800basicGuidePage() {
        console.log('debugger:WelcomePage.open7800basicGuidePage');
        browser.OpenUrlInBrowser('http://www.randomterrain.com/7800basic.html');
    }
    openDiscussionPage() {
        console.log('debugger:WelcomePage.openDiscussionPage');
        browser.OpenUrlInBrowser('http://atariage.com/forums/topic/290365-atari-dev-studio-for-homebrew-development-release/');
    }
    openGitHubIssue() {
        console.log('debugger:WelcomePage.openGitHubIssue');
        browser.OpenUrlInBrowser('https://github.com/chunkypixel/atari-dev-studio/issues');
    }
}
exports.WelcomePage = WelcomePage;
//# sourceMappingURL=welcome.js.map
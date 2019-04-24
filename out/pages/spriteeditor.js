"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const opn = require("open");
class SpriteEditorPage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    openPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SpriteEditorPage.openPage');
            // Prepare
            let contentPath = path.join(context.extensionPath, 'out', 'content', 'pages', 'spriteEditor');
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
                this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Sprite Editor', columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.file(contentPath)]
                });
                // Content
                let startPagePath = vscode.Uri.file(path.join(contentPath.toString(), 'index.html'));
                let content = fs.readFileSync(startPagePath.fsPath, 'utf8');
                let nonce = this.getNonce();
                // Script
                let scriptJsPath = vscode.Uri.file(path.join(contentPath.toString(), 'main.js'));
                let scriptJsUri = scriptJsPath.with({ scheme: 'vscode-resource' });
                // Style
                let styleCssPath = vscode.Uri.file(path.join(contentPath.toString(), 'main.css'));
                let styleCssUri = styleCssPath.with({ scheme: 'vscode-resource' });
                // Resource
                let vscodeResourcePath = vscode.Uri.file(contentPath.toString());
                let vsCodeResourceUri = vscodeResourcePath.with({ scheme: 'vscode-resource' });
                // Extension
                let basePath = vscode.Uri.file(contentPath.toString());
                let basePathUri = basePath.with({ scheme: 'vscode-resource' }).toString() + '/';
                // Update tags in content
                content = this.replaceContentTag(content, "APPNAME", "Sprite Editor");
                content = this.replaceContentTag(content, "NONCE", nonce);
                content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
                content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
                content = this.replaceContentTag(content, "BASEPATHURI", basePathUri);
                content = this.replaceContentTag(content, "VSCODERESOURCEURI", vsCodeResourceUri);
                // Set
                this.currentPanel.webview.html = content;
            }
            // Capture command messages
            this.currentPanel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'commandId':
                        return;
                }
                // Unknown
                console.log(`debugger:SpriteEditorPage: Unknown command called: ${message.command}`);
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
    openUrl(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //let options:
                opn(uri);
            }
            catch (_a) { }
        });
    }
}
exports.SpriteEditorPage = SpriteEditorPage;
//# sourceMappingURL=spriteeditor.js.map
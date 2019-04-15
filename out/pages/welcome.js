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
const Application = require("../application");
class WelcomePage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    openWelcomePage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:WelcomePage.openWelcomePage');
            // Prepare
            let contentPath = path.join(context.extensionPath, 'out', 'content', 'pages', 'welcome');
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
                this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Atari Dev Studio Welcome', columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(contentPath)]
                });
                // Content
                let startPagePath = vscode.Uri.file(path.join(contentPath.toString(), 'index.html'));
                let content = fs.readFileSync(startPagePath.fsPath, 'utf8');
                let nonce = this.getNonce();
                // Script
                let scriptJsPath = vscode.Uri.file(path.join(contentPath.toString(), 'script.js'));
                let scriptJsUri = scriptJsPath.with({ scheme: 'vscode-resource' });
                // Style
                let styleCssPath = vscode.Uri.file(path.join(contentPath.toString(), 'style.css'));
                let styleCssUri = styleCssPath.with({ scheme: 'vscode-resource' });
                // Update tags in content
                content = this.replaceContentTag(content, "APPDISPLAYNAME", Application.DisplayName);
                content = this.replaceContentTag(content, "APPDESCRIPTION", Application.Description);
                content = this.replaceContentTag(content, "APPVERSION", Application.Version);
                content = this.replaceContentTag(content, "NONCE", nonce);
                content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
                content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
                // Set
                this.currentPanel.webview.html = content;
            }
            // Capture command messages
            this.currentPanel.webview.onDidReceiveMessage(message => {
                console.log(`bbFeature.openWelcomePage.command.${message.command}`);
                switch (message.command) {
                    case 'openNewFile':
                        this.openNewFileDocument("bB");
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
                    case 'openDPCKernalTemplate':
                        let dpcTemplatePath = vscode.Uri.file(path.join(contentPath.toString(), 'templates', 'DPCKernel.bas'));
                        let dpcContent = fs.readFileSync(dpcTemplatePath.fsPath, 'utf8');
                        this.openNewFileDocument("bB", dpcContent);
                        return;
                    case 'openMultispriteKernalTemplate':
                        let multispriteTemplatePath = vscode.Uri.file(path.join(contentPath.toString(), 'templates', 'MultispriteKernel.bas'));
                        let multispriteContent = fs.readFileSync(multispriteTemplatePath.fsPath, 'utf8');
                        this.openNewFileDocument("bB", multispriteContent);
                        return;
                    case 'openStandardKernalTemplate':
                        let standardTemplatePath = vscode.Uri.file(path.join(contentPath.toString(), 'templates', 'StandardKernel.bas'));
                        let standardContent = fs.readFileSync(standardTemplatePath.fsPath, 'utf8');
                        this.openNewFileDocument("bB", standardContent);
                        return;
                    case 'openRandomTerrainPage':
                        this.openRandomTerrainPage();
                        return;
                    case 'openBatariBasicForum':
                        this.openBatariBasicForum();
                        return;
                }
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
        console.log('debugger:bBFeature.openBatariBasicForum');
        this.openUrl("http://atariage.com/forums/forum/65-batari-basic/");
    }
    openRandomTerrainPage() {
        console.log('debugger:bBFeature.openRandomTerrainPage');
        this.openUrl("http://www.randomterrain.com/atari-2600-memories-batari-basic-commands.html");
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
exports.WelcomePage = WelcomePage;
//# sourceMappingURL=welcome.js.map
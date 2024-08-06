"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';
import * as application from "../application";

export class WelcomePage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext) {
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

        } else {
            // Create
            this.currentPanel = vscode.window.createWebviewPanel(
                'webpage',
                `${application.DisplayName}`,
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [contentUri]
                }
            );

            // Content
            let startPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
            let content = await filesystem.ReadFileAsync(startPagePath.fsPath);
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
            content = this.replaceContentTag(content, "BASEPATHURI", contentUri.path +"/");
            content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
            content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);

            // Set
            this.currentPanel.webview.html = content;
        }

        // Capture command messages
        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openNewFile':
                        this.openNewFileDocument("batariBasic");
                        return;

                    case 'openFolder':
                        const options: vscode.OpenDialogOptions = {
                            canSelectFolders: true,
                            canSelectMany: false,
                            openLabel: 'Open Folder'
                        };
                        vscode.window.showOpenDialog(options).then(async folderUri => {
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

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private replaceContentTag(content: string, tag: string, tagContent: any) : string
    {
        tag = `%${tag}%`;
        return content.replace(new RegExp(tag, 'g'), tagContent);
    }

    private openNewFileDocument(language: string, content: string = '') {
        vscode.workspace.openTextDocument({language: `${language}`, content: content}).then(doc => {
            // Open
            vscode.window.showTextDocument(doc);
        });
    }

    private openBatariBasicForum() {
        console.log('debugger:WelcomePage.openBatariBasicForum');

        application.OpenBrowserWindow("http://atariage.com/forums/forum/65-batari-basic/");
    }

    private open7800ProgrammingForum() {
        console.log('debugger:WelcomePage.open7800ProgrammingForum');

        application.OpenBrowserWindow("http://atariage.com/forums/forum/52-atari-7800-programming/");
    }

    private openBatariGuidePage() {
        console.log('debugger:WelcomePage.openBatariGuidePage');

        application.OpenBrowserWindow("http://www.randomterrain.com/atari-2600-memories-batari-basic-commands.html");
    }

    private open7800basicGuidePage() {
        console.log('debugger:WelcomePage.open7800basicGuidePage');

        application.OpenBrowserWindow("http://www.randomterrain.com/7800basic.html");
    }

    private openDiscussionPage() {
        console.log('debugger:WelcomePage.openDiscussionPage');

        application.OpenBrowserWindow("http://atariage.com/forums/topic/290365-atari-dev-studio-for-homebrew-development-release/");
    }

    private openGitHubIssue() {
        console.log('debugger:WelcomePage.openGitHubIssue');

        application.OpenBrowserWindow("https://github.com/chunkypixel/atari-dev-studio/issues");
    }

    private openSpriteEditor() {
        vscode.commands.executeCommand('extension.openSpriteEditorPage');
    }

}
"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';
import * as application from "../application";
import opn = require('open');

export class WelcomePage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext) {
        console.log('debugger:WelcomePage.openPage');

        // Prepare
        let contentPath = path.join(context.extensionPath, 'out', 'content', 'pages', 'welcome');
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
                    localResourceRoots: [vscode.Uri.file(contentPath)]
                }
            );

            // Content
            let startPagePath = vscode.Uri.file(path.join(contentPath.toString(), 'index.html'));
            let content = await filesystem.ReadFileAsync(startPagePath.fsPath);
            let nonce = this.getNonce();
            
            // Script
            let scriptJsPath = vscode.Uri.file(path.join(contentPath.toString(), 'script.js'));
            let scriptJsUri = scriptJsPath.with({ scheme: 'vscode-resource' });

            // Style
            let styleCssPath = vscode.Uri.file(path.join(contentPath.toString(), 'style.css'));
            let styleCssUri = styleCssPath.with({ scheme: 'vscode-resource' });

            // Update tags in content
            content = this.replaceContentTag(content, "APPDISPLAYNAME", application.DisplayName);
            content = this.replaceContentTag(content, "APPDESCRIPTION", application.Description);
            content = this.replaceContentTag(content, "APPVERSION", application.Version);
            content = this.replaceContentTag(content, "NONCE", nonce);
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

                    case 'openSpriteEditor':
                        this.openSpriteEditor();
                        return;

                    // case 'openDPCKernalTemplate':
                    //     let dpcTemplatePath = vscode.Uri.file(path.join(contentPath.toString(), 'templates', 'DPCKernel.bas'));
                    //     let dpcContent = fs.readFileSync(dpcTemplatePath.fsPath, 'utf8');
                    //     this.openNewFileDocument("bB", dpcContent);
                    //     return;

                    // case 'openMultispriteKernalTemplate':
                    //     let multispriteTemplatePath = vscode.Uri.file(path.join(contentPath.toString(), 'templates', 'MultispriteKernel.bas'));
                    //     let multispriteContent = fs.readFileSync(multispriteTemplatePath.fsPath, 'utf8');
                    //     this.openNewFileDocument("bB", multispriteContent);
                    //     return;

                    // case 'openStandardKernalTemplate':
                    //     let standardTemplatePath = vscode.Uri.file(path.join(contentPath.toString(), 'templates', 'StandardKernel.bas'));
                    //     let standardContent = fs.readFileSync(standardTemplatePath.fsPath, 'utf8');
                    //     this.openNewFileDocument("bB", standardContent);
                    //     return;

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

        this.openUrl("http://atariage.com/forums/forum/65-batari-basic/");
    }

    private open7800ProgrammingForum() {
        console.log('debugger:WelcomePage.open7800ProgrammingForum');

        this.openUrl("http://atariage.com/forums/forum/52-atari-7800-programming/");
    }

    private openBatariGuidePage() {
        console.log('debugger:WelcomePage.openBatariGuidePage');

        this.openUrl("http://www.randomterrain.com/atari-2600-memories-batari-basic-commands.html");
    }

    private open7800basicGuidePage() {
        console.log('debugger:WelcomePage.open7800basicGuidePage');

        this.openUrl("http://www.randomterrain.com/7800basic.html");
    }

    private openDiscussionPage() {
        console.log('debugger:WelcomePage.openDiscussionPage');

        this.openUrl("http://atariage.com/forums/topic/290365-atari-dev-studio-for-homebrew-development-release/");
    }

    private openGitHubIssue() {
        console.log('debugger:WelcomePage.openGitHubIssue');

        this.openUrl("https://github.com/chunkypixel/atari-dev-studio/issues");
    }

    private openSpriteEditor() {
        vscode.commands.executeCommand('extension.openSpriteEditorPage');
    }

    public async openUrl(uri: string) {
        try {
            //let options:
            opn(uri); 
        }
        catch {}
    }

}
"use strict";
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as Application from '../application';
import opn = require('open');

export class SpriteEditorPage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext) {
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

        } else {
            // Create
            this.currentPanel = vscode.window.createWebviewPanel(
                'webpage',
                'Sprite Editor',
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.file(contentPath)]
                }
            );

            // Content
            let startPagePath = vscode.Uri.file(path.join(contentPath.toString(),'index.html'));
            let content = fs.readFileSync(startPagePath.fsPath,'utf8');
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
            content = this.replaceContentTag(content, "APPNAME", "Sprite Editor")
            content = this.replaceContentTag(content, "NONCE", nonce);
            content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
            content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
            content = this.replaceContentTag(content, "BASEPATHURI", basePathUri);
            content = this.replaceContentTag(content, "VSCODERESOURCEURI", vsCodeResourceUri)

            // Set
            this.currentPanel.webview.html = content;
        }

        // Capture command messages
        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'commandId':
                        return;
                }

                // Unknown
                console.log(`debugger:SpriteEditorPage: Unknown command called: ${message.command}`);
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

    private async openUrl(uri: string) {
        try {
            //let options:
            opn(uri); 
        }
        catch {}
    }

}
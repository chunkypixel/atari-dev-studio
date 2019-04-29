"use strict";
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as filesystem from '../filesystem';
import opn = require('open');

export class SpriteEditorPage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;
    protected contentPath: string = "";

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext) {
        console.log('debugger:SpriteEditorPage.openPage');
        
        // Prepare
        this.contentPath = path.join(context.extensionPath, 'out', 'content', 'pages', 'spriteeditor');
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
                    localResourceRoots: [vscode.Uri.file(this.contentPath)]
                }
            );

            // Content
            let startPagePath = vscode.Uri.file(path.join(this.contentPath,'index.html'));
            let content = await filesystem.ReadFileAsync(startPagePath.fsPath);
            let nonce = this.getNonce();
            
            // Script
            let scriptJsPath = vscode.Uri.file(path.join(this.contentPath, 'main.js'));
            let scriptJsUri = scriptJsPath.with({ scheme: 'vscode-resource' });

            // Style
            let styleCssPath = vscode.Uri.file(path.join(this.contentPath, 'main.css'));
            let styleCssUri = styleCssPath.with({ scheme: 'vscode-resource' });

            // Extension
            let basePath = vscode.Uri.file(this.contentPath);
            let basePathUri = basePath.with({ scheme: 'vscode-resource' }).toString() + '/';

            // Configuration
            let configuration = await this.loadConfiguration();

            // Update tags in content
            content = this.replaceContentTag(content, "APPNAME", "Sprite Editor")
            content = this.replaceContentTag(content, "NONCE", nonce);
            content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
            content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
            content = this.replaceContentTag(content, "BASEPATHURI", basePathUri);
            content = this.replaceContentTag(content, "CONFIGURATION", configuration);

            // Display
            this.currentPanel.webview.html = content;        
        }

        // Capture command messages
        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'loadProject':
                        this.loadProject(message);
                        return;

                    case 'saveProject':
                        this.saveProject(message);
                        return;

                    case 'saveAsPngFile':
                        this.saveAsPngFile(message);
                        return;

                    case 'configuration':
                        this.saveConfiguration(message);
                        return
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

    private async loadConfiguration(): Promise<string> {
        // Process
        let configurationFileUri = vscode.Uri.file(path.join(this.contentPath, 'spriteeditor.config'));
        let data = await filesystem.ReadFileAsync(configurationFileUri.fsPath);

        // Return BASE64
        if (data) return Buffer.from(data).toString("base64");
        return "";
    }

    private async saveConfiguration(message: any): Promise<boolean> {
        // Prepare
        let data = message!.data;
        let configurationFileUri = vscode.Uri.file(path.join(this.contentPath, 'spriteeditor.config'));

        // Process
        return await filesystem.WriteFileAsync(configurationFileUri.fsPath, data); 
    }

    private async loadProject(message: any): Promise<boolean> {
        // Prompt user here, get selected file content
        // and send response back to webview

        // Prepare
        let command = message!.command;
        //let content = message!.content;
        //let file = message!.file;

        // Options
        let options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            filters: {
                'Sprite Editor': ['spe'],
                'All Files': ['*']
            }
        };

        // Process
        vscode.window.showOpenDialog(options).then(async fileUri => {
            if (fileUri && fileUri[0]) {
                // Process
                try {
                    // Load
                    let data = await filesystem.ReadFileAsync(fileUri[0].fsPath);

                    // Result
                    this.currentPanel!.webview.postMessage({
                        command: command,
                        status: 'ok',
                        file: fileUri[0].fsPath,
                        data: data
                    });
                                       
                } catch (error) {
                    // Result
                    this.currentPanel!.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: error
                    }); 
                    return false;                   
                }
            }
        });

        // Result
        return true;
    }

    private async saveProject(message: any): Promise<boolean> {
        // If no file provided open in workspace
        // send response back to webview

        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = "";

        // Get file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);

        // Prompt user here
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Save",
            filters: {
                'Sprite Editor': ['spe'],
                'All Files': ['*']
            }
        };

        // TODO: this needs fixing (doesn't wait)
        // Process
        await vscode.window.showSaveDialog(options).then(async fileUri => {
            if (fileUri) {
                // Process
                try {
                    // Prepare
                    let folder = path.dirname(fileUri.fsPath);

                    // Save
                    let result = await filesystem.MkDirAsync(folder);
                    if (result) result = await filesystem.WriteFileAsync(fileUri.fsPath, data);

                    // Validate
                    if (result) {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'ok'
                        });
                        return true;                      
                    }

                    // Set
                    errorMessage = "Failed to save project";
                                       
                } catch (error) {
                    errorMessage = error;
                }

                // Result
                this.currentPanel!.webview.postMessage({
                    command: command,
                    status: 'error',
                    errorMessage: errorMessage
                });  
                return false;  
            }
        });

        // Result
        return true;
    }

    private async saveAsPngFile(message: any): Promise<boolean> {
        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = "";

        // Get file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);

        // Prompt user here
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Save",
            filters: {
                'PNG image': ['png']
            }
        };

        // TODO: this needs fixing (doesn't wait)
        // Process
        await vscode.window.showSaveDialog(options).then(async fileUri => {
            if (fileUri) {
                // Process
                try {
                    // Prepare
                    let folder = path.dirname(fileUri.fsPath);

                    // Save
                    let result = await filesystem.MkDirAsync(folder);
                    if (result) result = await filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data,'utf8'));

                    // Validate
                    if (result) {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'ok'
                        });
                        return true;                      
                    }

                    // Set
                    errorMessage = "Failed to save png file";
                                       
                } catch (error) {
                    errorMessage = error;
                }

                // Result
                this.currentPanel!.webview.postMessage({
                    command: command,
                    status: 'error',
                    errorMessage: errorMessage
                });  
                return false;  
            }
        });

        // Result
        return true;
    }
}
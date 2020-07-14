"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';
import opn = require('open');

export class SpriteEditorPage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;
    protected contentPath: string = "";

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext, fileUri?: vscode.Uri) {
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
            content = this.replaceContentTag(content, "APPNAME", "Sprite Editor");
            content = this.replaceContentTag(content, "NONCE", nonce);
            content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
            content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
            content = this.replaceContentTag(content, "BASEPATHURI", basePathUri);
            content = this.replaceContentTag(content, "CONFIGURATION", configuration);

            // Display
            this.currentPanel.webview.html = content;      
            
        }

        // Load provided file (via right-click popup in Explorer)?
        if (fileUri) { this.loadFileContent("loadProject", fileUri); }

        // Capture command messages
        this.currentPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'loadProject':
                        this.loadProject(message);
                        break;

                    case 'saveProject':
                        this.saveProject(message);
                        break;

                    case 'exportAsPngFile':
                        this.exportAsPngFile(message);
                        break;

                    case 'exportAsBatariFile':
                        this.exportAsBatariFile(message);
                        break;

                    case 'exportAsAssemblyFile':
                        this.exportAsAssemblyFile(message);
                        break;

                    case 'configuration':
                        this.saveConfiguration(message);
                        break;

                    case 'loadPalette':
                        this.loadPalette(message);
                        break;
                    
                    case 'savePalette':
                        this.savePalette(message);
                        break;

                    default:
                        // Unknown call - flag
                        console.log(`debugger:SpriteEditorPage: Unknown command called: ${message.command}`);
                        break;
                }
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
        if (data) { return Buffer.from(data).toString("base64"); }
        return "";
    }

    private saveConfiguration(message: any) {
        // Prepare
        let data = message!.data;
        let configurationFileUri = vscode.Uri.file(path.join(this.contentPath, 'spriteeditor.config'));

        // Process
        filesystem.WriteFileAsync(configurationFileUri.fsPath, data); 
    }

    private loadProject(message: any) {
        // Prompt user here, get selected file content
        // and send response back to webview

        // Prepare
        let command = message!.command;

        // Get current workspace
        let defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());

        // Options
        let options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            defaultUri: defaultUri,
            filters: {
                'Sprite Editor': ['spe'],
                'All Files': ['*']
            }
        };

        // Process
        vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) { 
                this.loadFileContent(command, fileUri[0]); 
            }
        });

        // Result
        return true;
    }

    private saveProject(message: any) {
        // If no file provided open in workspace
        // send response back to webview

        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = undefined;

        // Set default path
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);

        // Options
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Save",
            filters: {
                'Sprite Editor': ['spe'],
                'All Files': ['*']
            }
        };

        // Process
        vscode.window.showSaveDialog(options).then(fileUri => {
            // Save?
            if (fileUri) {
                // Prepare
                let folder = path.dirname(fileUri.fsPath);

                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                        filesystem.WriteFileAsync(fileUri.fsPath, data)
                            .then(() => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'ok',
                                    file: fileUri.fsPath,
                                });                    
                            })
                            .catch(() => {
                                errorMessage = `Failed to save project file: ${path.basename(fileUri.fsPath)}`;
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: errorMessage
                                });  
                            }); 
                        })
                    .catch(() => {
                        errorMessage = "Failed to create folder";
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: errorMessage
                        });  
                    });
 
            }          
        });
    }

    private exportAsPngFile(message: any) {
        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = undefined;

        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));

        // Prompt user here
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Export",
            filters: {
                'PNG image': ['png']
            }
        };

        // Process
        vscode.window.showSaveDialog(options).then(fileUri => {
            // Save?
            if (fileUri) {
                // Prepare
                let folder = path.dirname(fileUri.fsPath);

                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                        filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data,'utf8'))
                            .then(() => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'ok',
                                    file: path.basename(fileUri.fsPath),
                                });                    
                            })
                            .catch(() => {
                                errorMessage = `Failed to export image file: ${path.basename(fileUri.fsPath)}`;
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: errorMessage
                                });  
                            }); 
                        })
                    .catch(() => {
                        errorMessage = "Failed to create folder";
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: errorMessage
                        });  
                    });
            }
        });
    }

    private exportAsBatariFile(message: any) {
        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = undefined;

        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));

        // Prompt user here
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Export",
            filters: {
                'batari Basic': ['bb']
            }
        };

        // Process
        vscode.window.showSaveDialog(options).then(fileUri => {
            // Save?
            if (fileUri) {
                // Prepare
                let folder = path.dirname(fileUri.fsPath);

                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                        filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data,'utf8'))
                            .then(() => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'ok',
                                    file: path.basename(fileUri.fsPath),
                                });                    
                            })
                            .catch(() => {
                                errorMessage = `Failed to export source file: ${path.basename(fileUri.fsPath)}`;
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: errorMessage
                                });  
                            }); 
                        })
                    .catch(() => {
                        errorMessage = "Failed to create folder";
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: errorMessage
                        });  
                    });
            }
        });

    }

    private exportAsAssemblyFile(message: any) {
        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = undefined;

        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));

        // Prompt user here
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Export",
            filters: {
                'Assembly': ['asm']
            }
        };

        // Process
        vscode.window.showSaveDialog(options).then(fileUri => {
            // Save?
            if (fileUri) {
                // Prepare
                let folder = path.dirname(fileUri.fsPath);

                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                        filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data,'utf8'))
                            .then(() => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'ok',
                                    file: path.basename(fileUri.fsPath),
                                });                    
                            })
                            .catch(() => {
                                errorMessage = `Failed to export image file: ${path.basename(fileUri.fsPath)}`;
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: errorMessage
                                });  
                            }); 
                        })
                    .catch(() => {
                        errorMessage = "Failed to create folder";
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: errorMessage
                        });  
                    });
            }
        });
    }

    private loadPalette(message: any)  {
        // Prompt user here, get selected file content
        // and send response back to webview

        // Prepare
        let command = message!.command;

        // Get default path
        let defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());

        // Options
        let options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Open",
            defaultUri: defaultUri,
            filters: {
                'Sprite Editor Palette': ['palette'],
                'All Files': ['*']
            }
        };

        // Process
        vscode.window.showOpenDialog(options)
            .then(fileUri => {
                if (fileUri && fileUri[0]) { 
                    this.loadFileContent(command, fileUri[0]); 
                }
        });
    }

    private savePalette(message: any) {
        // If no file provided open in workspace
        // send response back to webview

        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;
        let errorMessage = undefined;

        // Get default path
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);
        
        // Options
        let options: vscode.SaveDialogOptions = {
            defaultUri: defaultUri,
            saveLabel: "Save",
            filters: {
                'Sprite Editor Palette': ['palette'],
                'All Files': ['*']
            }
        };

        // Process
        vscode.window.showSaveDialog(options).then(fileUri => {
            // Save?
            if (fileUri) {
                // Prepare
                let folder = path.dirname(fileUri.fsPath);

                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                        filesystem.WriteFileAsync(fileUri.fsPath, data)
                            .then(() => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'ok',
                                    file: fileUri.fsPath,
                                });                    
                            })
                            .catch(() => {
                                errorMessage = `Failed to save palette file: ${path.basename(fileUri.fsPath)}`;
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: errorMessage
                                });  
                            }); 
                        })
                    .catch(() => {
                        errorMessage = "Failed to create folder";
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: errorMessage
                        });  
                    });
            }
        });
    }

    private loadFileContent(command: string, fileUri: vscode.Uri) {
        filesystem.ReadFileAsync(fileUri.fsPath)
            .then(data => {
                  // Result
                  this.currentPanel!.webview.postMessage({
                    command: command,
                    status: 'ok',
                    file: fileUri.fsPath,
                    data: data
                });          
            })
            .catch(() => {
                let errorMessage = `Failed to load file: ${path.basename(fileUri.fsPath)}`;
                this.currentPanel!.webview.postMessage({
                    command: command,
                    status: 'error',
                    errorMessage: errorMessage
                }); 
            });
    }
}
"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from '../filesystem';
import * as application from '../application';
import opn = require('open');
import fs = require('fs');

export class SpriteEditorPage implements vscode.Disposable {

    protected currentPanel: vscode.WebviewPanel | undefined = undefined;

    public dispose(): void {
    }

    public async openPage(context: vscode.ExtensionContext, loadProjectUri?: vscode.Uri) {
        console.log('debugger:SpriteEditorPage.openPage');
        
        // Prepare
        let contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'spriteeditor'));
        let columnToShowIn = vscode.window.activeTextEditor
                                ? vscode.window.activeTextEditor.viewColumn
                                : undefined;
        let isOpen = false;

        // Open or create panel?
        if (this.currentPanel) {
            // Open
            this.currentPanel.reveal(columnToShowIn);
            isOpen = true;

            // loading project file?
            if (loadProjectUri) this.loadFileContent("loadProject", loadProjectUri, 'utf-8')

        } else {
            // Create
            this.currentPanel = vscode.window.createWebviewPanel(
                'webpage',
                'Sprite Editor',
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [contentUri], 
                }
            );

            // Content
            let startPagePath = vscode.Uri.joinPath(contentUri,'index.html');
            let content = await filesystem.ReadFileAsync(startPagePath.fsPath,'utf-8');
            let nonce = this.getNonce();
            
            // Script
            let scriptJsPath = vscode.Uri.joinPath(contentUri, 'main.js');
            let scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);

            // Style
            let styleCssPath = vscode.Uri.joinPath(contentUri, 'main.css');
            let styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);

            // Extension
            //let basePath = vscode.Uri.file(this.contentPath);
            //let basePathUri = basePath.with({ scheme: 'vscode-resource' }).toString() + '/';

            // Configuration
            let configuration = await this.loadConfiguration(contentUri);

            // Update tags in content
            content = this.replaceContentTag(content, "APPNAME", "Sprite Editor");
            content = this.replaceContentTag(content, "NONCE", nonce);
            content = this.replaceContentTag(content, "CSPSOURCE", this.currentPanel.webview.cspSource);
            content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
            content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
            content = this.replaceContentTag(content, "BASEPATHURI", contentUri.path +"/");
            content = this.replaceContentTag(content, "CONFIGURATION", configuration);

            // Display
            this.currentPanel.webview.html = content;    
            
            // Events
            // NOTE: we only need to configure these once otherwise we get multiple events called
            
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

                        case 'importAsPngFile':
                            this.importAsPngFile(message);
                            break;

                        case 'exportAsPngFile':
                            this.exportAsPngFile(message);
                            break;

                        case 'exportAllAsPngFile':
                            this.exportAllAsPngFile(message);
                            break;

                        case 'exportAsBatariFile':
                            this.exportAsBatariFile(message);
                            break;

                        case 'exportAsAssemblyFile':
                            this.exportAsAssemblyFile(message);
                            break;

                        case 'configuration':
                            this.saveConfiguration(contentUri, message);
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

        // Load provided file (via right-click popup in Explorer)?
        if (loadProjectUri) {
            // Put in a delay to ensure editor is fully loaded before importing project
            let delay = (!isOpen ? 750 : 5);

             // Process
            await application.Delay(delay).then(_ =>
                 this.loadFileContent("loadProject", loadProjectUri, 'utf-8')
            )
        } else {
            // normal opening - show project if chosen by user
            this.attemptToOpenProjectWindowOnStartup(); 
        }

    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private replaceContentTag(content: string, tag: string, tagContent: any): string
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

    private async loadConfiguration(contentUri : vscode.Uri): Promise<string> {
        // Process
        let configurationFileUri = vscode.Uri.joinPath(contentUri, 'spriteeditor.config');
        let data = await filesystem.ReadFileAsync(configurationFileUri.fsPath,'utf-8');

        // Return BASE64
        if (data) { return Buffer.from(data).toString("base64"); }
        return "";
    }

    private saveConfiguration(contentUri : vscode.Uri, message: any) {
        // Prepare
        let data = message!.data;
        let configurationFileUri = vscode.Uri.joinPath(contentUri, 'spriteeditor.config');

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
                this.loadFileContent(command, fileUri[0], 'utf-8'); 
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
                            .catch((e) => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: `Failed to save project '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                                });  
                            }); 
                        })
                    .catch((e) => {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: e.message
                        });  
                    });
 
            }          
        });
    }

    private importAsPngFile(message: any) {
        // Prompt user here, get selected file content
        // and send response back to webview

        // Prepare
        let command = message!.command;

        // Get current workspace
        let defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());

        // Options
        let options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Import",
            defaultUri: defaultUri,
            filters: {
                'Png Files': ['png']
            }
        };

        // Process
        vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) { 
                this.loadFileContent(command, fileUri[0], 'base64'); 
            }
        });

        // Result
        return true;
    }

    private exportAsPngFile(message: any) {
        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;

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
                        // We now send through in base64 to avoid Buffer.from() conversion errors
                        let convertToBuffer = Buffer.from(data,"base64");
                        filesystem.WriteFileAsync(fileUri.fsPath, convertToBuffer)
                            .then(() => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'ok',
                                    file: path.basename(fileUri.fsPath),
                                });                    
                            })
                            .catch((e) => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: `Failed to export sprite to file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                                });  
                            }); 
                        })
                    .catch((e) => {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: e.message
                        });  
                    });
            }
        });
    }

    private exportAllAsPngFile(message: any) {
        // Prepare
        let command = message!.command;
        let file = message!.file;
        let data = message!.data;

        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));

        // Prompt user here
        let options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            canSelectFolders: true,
            canSelectFiles: false,
            openLabel: "Export (Individual Files)",
            defaultUri: defaultUri,
            filters: {
                'All Files': ['*']
            }
        };

        // Process
        vscode.window.showOpenDialog(options).then(folderUri => {
            // Save?
            if (folderUri) {
                // Prepare
                let folder = folderUri[0].fsPath;

                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                        // Process each image
                        for (let i = 0; i < data.count; i++) {
                            // Loop through each file
                            let fileName = data.fileName + i + ".png";
                            let fileUri = vscode.Uri.file(path.join(folder,fileName));
                            // We now send through in base64 to avoid Buffer.from() conversion errors
                            let convertToBuffer = Buffer.from(data.sprites[i],"base64");
                            filesystem.WriteFileAsync(fileUri.fsPath, convertToBuffer)
                                .then(() => {
                                    this.currentPanel!.webview.postMessage({
                                        command: command,
                                        status: 'ok',
                                        file: path.basename(fileUri.fsPath),
                                    });                    
                                })
                                .catch((e) => {
                                    this.currentPanel!.webview.postMessage({
                                        command: command,
                                        status: 'error',
                                        errorMessage: `Failed to export sprite to file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                                    });  
                                }); 
                        }
                    })
                    .catch((e) => {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: e.message
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
                            .catch((e) => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: `Failed to export source file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                                });  
                            }); 
                        })
                    .catch((e) => {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: e.message
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
                            .catch((e) => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: `Failed to export assembly file '${path.basename(fileUri.fsPath)}' (Error:${e.message})`
                                });  
                            }); 
                        })
                    .catch((e) => {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: e.message
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
                    this.loadFileContent(command, fileUri[0], 'utf-8'); 
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
                            .catch((e) => {
                                this.currentPanel!.webview.postMessage({
                                    command: command,
                                    status: 'error',
                                    errorMessage: `Failed to save palette '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                                });  
                            }); 
                        })
                    .catch((e) => {
                        this.currentPanel!.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: e.message
                        });  
                    });
            }
        });
    }

    private loadFileContent(command: string, fileUri: vscode.Uri, encoding:BufferEncoding | null) {
        filesystem.ReadFileAsync(fileUri.fsPath, encoding)
            .then(data => {
                   // Result
                  this.currentPanel!.webview.postMessage({
                    command: command,
                    status: 'ok',
                    file: fileUri.fsPath,
                    data: data
                });          
            })
            .catch((e) => {
                this.currentPanel!.webview.postMessage({
                    command: command,
                    status: 'error',
                    errorMessage: `Failed to load file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                }); 
            });
    }

    private attemptToOpenProjectWindowOnStartup() {
        this.currentPanel!.webview.postMessage({
            command: "attemptToOpenProjectWindowOnStartup",
            status: 'ok'
        }); 
    }
}
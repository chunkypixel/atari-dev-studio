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
exports.SpriteEditorPage = void 0;
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
const application = require("../application");
const opn = require("open");
class SpriteEditorPage {
    constructor() {
        this.currentPanel = undefined;
    }
    dispose() {
    }
    openPage(context, loadProjectUri) {
        return __awaiter(this, void 0, void 0, function* () {
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
                if (loadProjectUri)
                    this.loadFileContent("loadProject", loadProjectUri);
            }
            else {
                // Create
                this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Sprite Editor', columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [contentUri],
                });
                // Content
                let startPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
                let content = yield filesystem.ReadFileAsync(startPagePath.fsPath);
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
                let configuration = yield this.loadConfiguration(startPagePath);
                // Update tags in content
                content = this.replaceContentTag(content, "APPNAME", "Sprite Editor");
                content = this.replaceContentTag(content, "NONCE", nonce);
                content = this.replaceContentTag(content, "CSPSOURCE", this.currentPanel.webview.cspSource);
                content = this.replaceContentTag(content, "SCRIPTJSURI", scriptJsUri);
                content = this.replaceContentTag(content, "STYLECSSURI", styleCssUri);
                content = this.replaceContentTag(content, "BASEPATHURI", contentUri.path + "/");
                content = this.replaceContentTag(content, "CONFIGURATION", configuration);
                // Display
                this.currentPanel.webview.html = content;
                // Events
                // NOTE: we only need to configure these once otherwise we get multiple events called
                // Capture command messages
                this.currentPanel.webview.onDidReceiveMessage(message => {
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
                });
                // Capture dispose
                this.currentPanel.onDidDispose(() => {
                    this.currentPanel = undefined;
                }, null);
            }
            // Load provided file (via right-click popup in Explorer)?
            if (loadProjectUri) {
                // Put in a delay to ensure editor is fully loaded before importing project
                let delay = (!isOpen ? 750 : 5);
                // Process
                yield application.Delay(delay).then(_ => this.loadFileContent("loadProject", loadProjectUri));
            }
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
    loadConfiguration(contentUri) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            let configurationFileUri = vscode.Uri.joinPath(contentUri, 'spriteeditor.config');
            let data = yield filesystem.ReadFileAsync(configurationFileUri.fsPath);
            // Return BASE64
            if (data) {
                return Buffer.from(data).toString("base64");
            }
            return "";
        });
    }
    saveConfiguration(contentUri, message) {
        // Prepare
        let data = message.data;
        let configurationFileUri = vscode.Uri.joinPath(contentUri, 'spriteeditor.config');
        // Process
        filesystem.WriteFileAsync(configurationFileUri.fsPath, data);
    }
    loadProject(message) {
        // Prompt user here, get selected file content
        // and send response back to webview
        // Prepare
        let command = message.command;
        // Get current workspace
        let defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());
        // Options
        let options = {
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
    saveProject(message) {
        // If no file provided open in workspace
        // send response back to webview
        // Prepare
        let command = message.command;
        let file = message.file;
        let data = message.data;
        // Set default path
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);
        // Options
        let options = {
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
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: fileUri.fsPath,
                        });
                    })
                        .catch((e) => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: `Failed to save project '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                        });
                    });
                })
                    .catch((e) => {
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: e.message
                    });
                });
            }
        });
    }
    exportAsPngFile(message) {
        // Prepare
        let command = message.command;
        let file = message.file;
        let data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        let options = {
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
                    let convertToBuffer = Buffer.from(data, "base64");
                    filesystem.WriteFileAsync(fileUri.fsPath, convertToBuffer)
                        .then(() => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: path.basename(fileUri.fsPath),
                        });
                    })
                        .catch((e) => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: `Failed to export image '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                        });
                    });
                })
                    .catch((e) => {
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: e.message
                    });
                });
            }
        });
    }
    exportAllAsPngFile(message) {
        // Prepare
        let command = message.command;
        let file = message.file;
        let data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        let options = {
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
                        let fileUri = vscode.Uri.file(path.join(folder, fileName));
                        // We now send through in base64 to avoid Buffer.from() conversion errors
                        let convertToBuffer = Buffer.from(data.sprites[i], "base64");
                        filesystem.WriteFileAsync(fileUri.fsPath, convertToBuffer)
                            .then(() => {
                            this.currentPanel.webview.postMessage({
                                command: command,
                                status: 'ok',
                                file: path.basename(fileUri.fsPath),
                            });
                        })
                            .catch((e) => {
                            this.currentPanel.webview.postMessage({
                                command: command,
                                status: 'error',
                                errorMessage: `Failed to export image '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                            });
                        });
                    }
                })
                    .catch((e) => {
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: e.message
                    });
                });
            }
        });
    }
    exportAsBatariFile(message) {
        // Prepare
        let command = message.command;
        let file = message.file;
        let data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        let options = {
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
                    filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data, 'utf8'))
                        .then(() => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: path.basename(fileUri.fsPath),
                        });
                    })
                        .catch((e) => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: `Failed to export source file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                        });
                    });
                })
                    .catch((e) => {
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: e.message
                    });
                });
            }
        });
    }
    exportAsAssemblyFile(message) {
        // Prepare
        let command = message.command;
        let file = message.file;
        let data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        let options = {
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
                    filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data, 'utf8'))
                        .then(() => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: path.basename(fileUri.fsPath),
                        });
                    })
                        .catch((e) => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: `Failed to export assembly file '${path.basename(fileUri.fsPath)}' (Error:${e.message})`
                        });
                    });
                })
                    .catch((e) => {
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: e.message
                    });
                });
            }
        });
    }
    loadPalette(message) {
        // Prompt user here, get selected file content
        // and send response back to webview
        // Prepare
        let command = message.command;
        // Get default path
        let defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());
        // Options
        let options = {
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
    savePalette(message) {
        // If no file provided open in workspace
        // send response back to webview
        // Prepare
        let command = message.command;
        let file = message.file;
        let data = message.data;
        // Get default path
        let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);
        // Options
        let options = {
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
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: fileUri.fsPath,
                        });
                    })
                        .catch((e) => {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: `Failed to save palette '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
                        });
                    });
                })
                    .catch((e) => {
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: e.message
                    });
                });
            }
        });
    }
    loadFileContent(command, fileUri) {
        filesystem.ReadFileAsync(fileUri.fsPath)
            .then(data => {
            // Result
            this.currentPanel.webview.postMessage({
                command: command,
                status: 'ok',
                file: fileUri.fsPath,
                data: data
            });
        })
            .catch((e) => {
            this.currentPanel.webview.postMessage({
                command: command,
                status: 'error',
                errorMessage: `Failed to load file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
            });
        });
    }
}
exports.SpriteEditorPage = SpriteEditorPage;
//# sourceMappingURL=spriteeditor.js.map
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
const browser = require("../browser");
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
            const contentUri = vscode.Uri.file(path.join(context.extensionPath, 'out', 'content', 'pages', 'spriteeditor'));
            const columnToShowIn = vscode.window.activeTextEditor
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
                    this.loadFileContent("loadProject", loadProjectUri, 'utf-8');
            }
            else {
                // Create
                this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Sprite Editor', columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [contentUri],
                });
                // Content
                const startPagePath = vscode.Uri.joinPath(contentUri, 'index.html');
                const nonce = browser.GenerateNonce();
                // Script
                const scriptJsPath = vscode.Uri.joinPath(contentUri, 'main.js');
                const scriptJsUri = this.currentPanel.webview.asWebviewUri(scriptJsPath);
                // Style
                const styleCssPath = vscode.Uri.joinPath(contentUri, 'main.css');
                const styleCssUri = this.currentPanel.webview.asWebviewUri(styleCssPath);
                // Extension
                //let basePath = vscode.Uri.file(this.contentPath);
                //let basePathUri = basePath.with({ scheme: 'vscode-resource' }).toString() + '/';
                // Configuration
                const configuration = yield this.loadConfiguration(contentUri);
                // Update tags in content
                let content = yield filesystem.ReadFileAsync(startPagePath.fsPath, 'utf-8');
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
                });
                // Capture dispose
                this.currentPanel.onDidDispose(() => {
                    this.currentPanel = undefined;
                }, null);
            }
            // Load provided file (via right-click popup in Explorer)?
            if (loadProjectUri) {
                // Put in a delay to ensure editor is fully loaded before importing project
                const delay = (!isOpen ? 750 : 5);
                // Process
                yield application.Delay(delay).then(_ => this.loadFileContent("loadProject", loadProjectUri, 'utf-8'));
            }
            else {
                // normal opening - show project if chosen by user
                this.attemptToOpenProjectWindowOnStartup();
            }
        });
    }
    replaceContentTag(content, tag, tagContent) {
        tag = `%${tag}%`;
        return content.replace(new RegExp(tag, 'g'), tagContent);
    }
    loadConfiguration(contentUri) {
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            const configurationFileUri = vscode.Uri.joinPath(contentUri, 'spriteeditor.config');
            const data = yield filesystem.ReadFileAsync(configurationFileUri.fsPath, 'utf-8');
            // Return BASE64
            if (data)
                return Buffer.from(data).toString("base64");
            return "";
        });
    }
    saveConfiguration(contentUri, message) {
        // Prepare
        const data = message.data;
        const configurationFileUri = vscode.Uri.joinPath(contentUri, 'spriteeditor.config');
        // Process
        filesystem.WriteFileAsync(configurationFileUri.fsPath, data);
    }
    loadProject(message) {
        // Prompt user here, get selected file content
        // and send response back to webview
        // Prepare
        const command = message.command;
        // Get current workspace
        const defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());
        // Options
        const options = {
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
    saveProject(message) {
        // If no file provided open in workspace
        // send response back to webview
        // Prepare
        const command = message.command;
        const file = message.file;
        const data = message.data;
        // Set default path
        const defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);
        // Options
        const options = {
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
                const folder = path.dirname(fileUri.fsPath);
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
    importAsPngFile(message) {
        // Prompt user here, get selected file content
        // and send response back to webview
        // Prepare
        const command = message.command;
        // Get current workspace
        const defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());
        // Options
        const options = {
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
    exportAsPngFile(message) {
        // Prepare
        const command = message.command;
        const file = message.file;
        const data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        const defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        const options = {
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
                            errorMessage: `Failed to export sprite to file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
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
        const command = message.command;
        const file = message.file;
        const data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        const defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        const options = {
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
                const folder = folderUri[0].fsPath;
                // Save
                filesystem.MkDirAsync(folder)
                    .then(() => {
                    // Prepare
                    // NOTE: determine how many trailing zeros so we can build up a index replacement the size
                    //       requested by the user
                    let templateFileName = data.fileName;
                    const totalZerosLength = application.CountTrailingZeros(templateFileName);
                    const indexTemplate = '0'.repeat(totalZerosLength);
                    // if we have trailing zeros strip them from the template name
                    if (totalZerosLength > 0)
                        templateFileName = application.TrimLeft(templateFileName, templateFileName.length - totalZerosLength);
                    // Process each image
                    for (let i = 0; i < data.count; i++) {
                        // loop through each file
                        // build filename
                        let fileName = templateFileName + application.ReplaceZerosTemplate(indexTemplate, i) + ".png";
                        // create file
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
                                errorMessage: `Failed to export sprite to file '${path.basename(fileUri.fsPath)}' (Error: ${e.message})`
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
        const command = message.command;
        const file = message.file;
        const data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        const defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        const options = {
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
                const folder = path.dirname(fileUri.fsPath);
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
        const command = message.command;
        const file = message.file;
        const data = message.data;
        // Get default path
        // Assuiming file provided is the project file
        const defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : path.dirname(file));
        // Prompt user here
        const options = {
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
                const folder = path.dirname(fileUri.fsPath);
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
        const command = message.command;
        // Get default path
        const defaultUri = vscode.Uri.file(filesystem.WorkspaceFolder());
        // Options
        const options = {
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
    savePalette(message) {
        // If no file provided open in workspace
        // send response back to webview
        // Prepare
        const command = message.command;
        const file = message.file;
        const data = message.data;
        // Get default path
        const defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);
        // Options
        const options = {
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
    loadFileContent(command, fileUri, encoding) {
        // Process
        filesystem.ReadFileAsync(fileUri.fsPath, encoding)
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
    attemptToOpenProjectWindowOnStartup() {
        this.currentPanel.webview.postMessage({
            command: "attemptToOpenProjectWindowOnStartup",
            status: 'ok'
        });
    }
}
exports.SpriteEditorPage = SpriteEditorPage;
//# sourceMappingURL=spriteeditor.js.map
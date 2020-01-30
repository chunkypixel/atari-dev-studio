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
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
const opn = require("open");
class SpriteEditorPage {
    constructor() {
        this.currentPanel = undefined;
        this.contentPath = "";
    }
    dispose() {
    }
    openPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else {
                // Create
                this.currentPanel = vscode.window.createWebviewPanel('webpage', 'Sprite Editor', columnToShowIn || vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [vscode.Uri.file(this.contentPath)]
                });
                // Content
                let startPagePath = vscode.Uri.file(path.join(this.contentPath, 'index.html'));
                let content = yield filesystem.ReadFileAsync(startPagePath.fsPath);
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
                let configuration = yield this.loadConfiguration();
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
            // Capture command messages
            this.currentPanel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'loadProject':
                        this.loadProject(message);
                        return;
                    case 'saveProject':
                        this.saveProject(message);
                        return;
                    case 'exportAsPngFile':
                        this.exportAsPngFile(message);
                        return;
                    case 'configuration':
                        this.saveConfiguration(message);
                        return;
                    case 'loadPalette':
                        this.loadPalette(message);
                        return;
                    case 'savePalette':
                        this.savePalette(message);
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
    loadConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            // Process
            let configurationFileUri = vscode.Uri.file(path.join(this.contentPath, 'spriteeditor.config'));
            let data = yield filesystem.ReadFileAsync(configurationFileUri.fsPath);
            // Return BASE64
            if (data) {
                return Buffer.from(data).toString("base64");
            }
            return "";
        });
    }
    saveConfiguration(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prepare
            let data = message.data;
            let configurationFileUri = vscode.Uri.file(path.join(this.contentPath, 'spriteeditor.config'));
            // Process
            return yield filesystem.WriteFileAsync(configurationFileUri.fsPath, data);
        });
    }
    loadProject(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prompt user here, get selected file content
            // and send response back to webview
            // Prepare
            let command = message.command;
            //let content = message!.content;
            //let file = message!.file;
            // Options
            let options = {
                canSelectMany: false,
                openLabel: "Open",
                filters: {
                    'Sprite Editor': ['spe'],
                    'All Files': ['*']
                }
            };
            // Process
            vscode.window.showOpenDialog(options).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                if (fileUri && fileUri[0]) {
                    // Process
                    try {
                        // Load
                        let data = yield filesystem.ReadFileAsync(fileUri[0].fsPath);
                        // Result
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: fileUri[0].fsPath,
                            data: data
                        });
                    }
                    catch (error) {
                        // Result
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: error
                        });
                        return false;
                    }
                }
            }));
            // Result
            return true;
        });
    }
    saveProject(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // If no file provided open in workspace
            // send response back to webview
            // Prepare
            let command = message.command;
            let file = message.file;
            let data = message.data;
            let errorMessage = "";
            // Set base uri
            let fileUri = vscode.Uri.file(file);
            // Prompt?
            if (!file) {
                // Options
                let options = {
                    defaultUri: vscode.Uri.file(filesystem.WorkspaceFolder()),
                    saveLabel: "Save",
                    filters: {
                        'Sprite Editor': ['spe'],
                        'All Files': ['*']
                    }
                };
                // Process
                let result = yield vscode.window.showSaveDialog(options);
                if (result) {
                    fileUri = result;
                }
            }
            // Save?
            if (fileUri) {
                // Process
                try {
                    // Prepare
                    let folder = path.dirname(fileUri.fsPath);
                    // Save
                    let result = yield filesystem.MkDirAsync(folder);
                    if (result) {
                        result = yield filesystem.WriteFileAsync(fileUri.fsPath, data);
                    }
                    // Validate
                    if (result) {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: fileUri.fsPath,
                        });
                        return true;
                    }
                    // Set
                    errorMessage = "Failed to save project";
                }
                catch (error) {
                    errorMessage = error;
                }
                // Result
                this.currentPanel.webview.postMessage({
                    command: command,
                    status: 'error',
                    errorMessage: errorMessage
                });
                return false;
            }
            // Result
            return true;
        });
    }
    exportAsPngFile(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prepare
            let command = message.command;
            let file = message.file;
            let data = message.data;
            let errorMessage = "";
            // Get file
            let defaultUri = vscode.Uri.file(!file ? filesystem.WorkspaceFolder() : file);
            // Prompt user here
            let options = {
                defaultUri: defaultUri,
                saveLabel: "Export",
                filters: {
                    'PNG image': ['png']
                }
            };
            // TODO: this needs fixing (doesn't wait)
            // Process
            yield vscode.window.showSaveDialog(options).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                if (fileUri) {
                    // Process
                    try {
                        // Prepare
                        let folder = path.dirname(fileUri.fsPath);
                        // Save
                        let result = yield filesystem.MkDirAsync(folder);
                        if (result) {
                            result = yield filesystem.WriteFileAsync(fileUri.fsPath, Buffer.from(data, 'utf8'));
                        }
                        // Validate
                        if (result) {
                            this.currentPanel.webview.postMessage({
                                command: command,
                                status: 'ok',
                                file: path.basename(fileUri.fsPath)
                            });
                            return true;
                        }
                        // Set
                        errorMessage = `Failed to export image file: ${path.basename(fileUri.fsPath)}`;
                    }
                    catch (error) {
                        errorMessage = error;
                    }
                    // Result
                    this.currentPanel.webview.postMessage({
                        command: command,
                        status: 'error',
                        errorMessage: errorMessage
                    });
                    return false;
                }
            }));
            // Result
            return true;
        });
    }
    loadPalette(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prompt user here, get selected file content
            // and send response back to webview
            // Prepare
            let command = message.command;
            //let content = message!.content;
            //let file = message!.file;
            // Options
            let options = {
                canSelectMany: false,
                openLabel: "Open",
                filters: {
                    'Sprite Editor Palette': ['palette'],
                    'All Files': ['*']
                }
            };
            // Process
            vscode.window.showOpenDialog(options).then((fileUri) => __awaiter(this, void 0, void 0, function* () {
                if (fileUri && fileUri[0]) {
                    // Process
                    try {
                        // Load
                        let data = yield filesystem.ReadFileAsync(fileUri[0].fsPath);
                        // Result
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: fileUri[0].fsPath,
                            data: data
                        });
                    }
                    catch (error) {
                        // Result
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'error',
                            errorMessage: error
                        });
                        return false;
                    }
                }
            }));
            // Result
            return true;
        });
    }
    savePalette(message) {
        return __awaiter(this, void 0, void 0, function* () {
            // If no file provided open in workspace
            // send response back to webview
            // Prepare
            let command = message.command;
            let file = message.file;
            let data = message.data;
            let errorMessage = "";
            // Set base uri
            let fileUri = vscode.Uri.file(file);
            // Prompt?
            if (!file) {
                // Options
                let options = {
                    defaultUri: vscode.Uri.file(filesystem.WorkspaceFolder()),
                    saveLabel: "Save",
                    filters: {
                        'Sprite Editor Palette': ['palette'],
                        'All Files': ['*']
                    }
                };
                // Process
                let result = yield vscode.window.showSaveDialog(options);
                if (result) {
                    fileUri = result;
                }
            }
            // Save?
            if (fileUri) {
                // Process
                try {
                    // Prepare
                    let folder = path.dirname(fileUri.fsPath);
                    // Save
                    let result = yield filesystem.MkDirAsync(folder);
                    if (result) {
                        result = yield filesystem.WriteFileAsync(fileUri.fsPath, data);
                    }
                    // Validate
                    if (result) {
                        this.currentPanel.webview.postMessage({
                            command: command,
                            status: 'ok',
                            file: fileUri.fsPath,
                        });
                        return true;
                    }
                    // Set
                    errorMessage = "Failed to save palette";
                }
                catch (error) {
                    errorMessage = error;
                }
                // Result
                this.currentPanel.webview.postMessage({
                    command: command,
                    status: 'error',
                    errorMessage: errorMessage
                });
                return false;
            }
            // Result
            return true;
        });
    }
}
exports.SpriteEditorPage = SpriteEditorPage;
//# sourceMappingURL=spriteeditor.js.map
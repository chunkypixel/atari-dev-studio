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
exports.GetAtariDevStudioConfiguration = GetAtariDevStudioConfiguration;
exports.GetChosenCompiler = GetChosenCompiler;
exports.TransferFolderToCustomFolders = TransferFolderToCustomFolders;
exports.ValidateCustomFoldersConfigurationEntry = ValidateCustomFoldersConfigurationEntry;
exports.ValidateOpenSamplesFileOnRestart = ValidateOpenSamplesFileOnRestart;
exports.GetCustomCompilerIdList = GetCustomCompilerIdList;
exports.GetCustomCompilerFolder = GetCustomCompilerFolder;
const vscode = require("vscode");
const application = require("./application");
const seventyEightHundredCustomFoldersSection = 'compiler.7800basic.customFolders';
const batariBasicCustomFoldersSection = 'compiler.batariBasic.customFolders';
function GetAtariDevStudioConfiguration() {
    return vscode.workspace.getConfiguration(application.Name);
}
function GetChosenCompiler(document) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    const editorConfig = vscode.workspace.getConfiguration('editor');
    // Find compiler (based on language of chosen file)
    const foundCompiler = application.Compilers.find(c => c.Id === document.languageId);
    if (foundCompiler)
        return foundCompiler;
    // Activate output window?
    if (editorConfig.get('preserveCodeEditorFocus', false)) {
        application.CompilerOutputChannel.show();
    }
    // Clear output content?
    if (editorConfig.get('clearPreviousOutput', false)) {
        application.CompilerOutputChannel.clear();
    }
    // No result
    return undefined;
}
function TransferFolderToCustomFolders(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        const config = GetAtariDevStudioConfiguration();
        const transferedFolderToCustomFoldersKey = `${application.Name}.configuration.transferedFolderToCustomFolders`;
        // Validate if we have already done it?
        const transferedFolderToCustomFolders = context.globalState.get(transferedFolderToCustomFoldersKey, false);
        if (transferedFolderToCustomFolders)
            return;
        // 7800basic
        const existing7800BasicCustomFolder = config.get('compiler.7800basic.folder', null);
        if (existing7800BasicCustomFolder && !CustomFolderExists(seventyEightHundredCustomFoldersSection, existing7800BasicCustomFolder)) {
            // Add
            const customFolder = { 'Custom': existing7800BasicCustomFolder };
            yield config.update(seventyEightHundredCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
        }
        // batariBasic
        const existingBatariBasicFolder = config.get('compiler.batariBasic.folder', null);
        if (existingBatariBasicFolder && !CustomFolderExists(batariBasicCustomFoldersSection, existingBatariBasicFolder)) {
            // Add
            const customFolder = { 'Custom': existingBatariBasicFolder };
            yield config.update(batariBasicCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
        }
        // Set
        yield context.globalState.update(transferedFolderToCustomFoldersKey, true);
    });
}
function ValidateCustomFoldersConfigurationEntry(event) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        const config = GetAtariDevStudioConfiguration();
        // 7800basic?
        if (event.affectsConfiguration(`${application.Name}.${seventyEightHundredCustomFoldersSection}`)) {
            yield sanitizeCustomFoldersEntry(seventyEightHundredCustomFoldersSection, config);
        }
        ;
        // batariBasic?
        if (event.affectsConfiguration(`${application.Name}.${batariBasicCustomFoldersSection}`)) {
            yield sanitizeCustomFoldersEntry(batariBasicCustomFoldersSection, config);
        }
        ;
    });
}
function sanitizeCustomFoldersEntry(section, config) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        const customFolders = config.get(section, {});
        const updated = {};
        let isChanged = false;
        // Validate for spaces in Key and remove
        for (const [key, value] of Object.entries(customFolders)) {
            const newKey = key.replace(/\s+/g, '').trim();
            if (newKey !== key)
                isChanged = true;
            updated[newKey] = value;
        }
        // Changed?
        if (isChanged) {
            yield config.update(section, updated, vscode.ConfigurationTarget.Global);
        }
    });
}
function ValidateOpenSamplesFileOnRestart(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        const openSampleFileOnRestartKey = `${application.Name}.configuration.openSampleFileOnRestart`;
        // Process?
        const sampleFilePath = context.globalState.get(`${application.Name}.configuration.openSampleFileOnRestart`);
        if (!sampleFilePath)
            return;
        // Yes! Open the file
        try {
            const document = yield vscode.workspace.openTextDocument(vscode.Uri.file(sampleFilePath));
            yield vscode.window.showTextDocument(document, { preview: false, preserveFocus: true });
        }
        catch (error) {
            // log or ignore — keep function resilient
        }
        // Clear
        yield context.globalState.update(openSampleFileOnRestartKey, undefined);
    });
}
function GetCustomCompilerIdList(languageId) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Get and return result
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    return Object.keys(customFolders);
}
function GetCustomCompilerFolder(languageId, id) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Scan
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    const found = Object.entries(customFolders).find(([key]) => key.toLowerCase() === id.toLowerCase());
    // Return result
    return found ? found[1] : '';
}
function CustomFolderExists(configurationSection, folder) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Scan and return result
    const customFolders = config.get(configurationSection, {});
    return Object.values(customFolders).some(value => value.toLowerCase() === folder.toLowerCase());
}
//# sourceMappingURL=configuration.js.map
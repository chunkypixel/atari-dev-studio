"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAtariDevStudioConfiguration = GetAtariDevStudioConfiguration;
exports.GetChosenCompiler = GetChosenCompiler;
exports.TransferFolderToCustomFolders = TransferFolderToCustomFolders;
exports.ValidateCustomFoldersConfigurationEntry = ValidateCustomFoldersConfigurationEntry;
exports.ValidateOpenSamplesFileOnRestart = ValidateOpenSamplesFileOnRestart;
exports.GetCustomCompilerIdList = GetCustomCompilerIdList;
exports.GetCustomCompilerFolder = GetCustomCompilerFolder;
exports.ContainsCustomCompilerTag = ContainsCustomCompilerTag;
const vscode = __importStar(require("vscode"));
const application = __importStar(require("./application"));
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
async function TransferFolderToCustomFolders(context) {
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
        await config.update(seventyEightHundredCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }
    // batariBasic
    const existingBatariBasicFolder = config.get('compiler.batariBasic.folder', null);
    if (existingBatariBasicFolder && !CustomFolderExists(batariBasicCustomFoldersSection, existingBatariBasicFolder)) {
        // Add
        const customFolder = { 'Custom': existingBatariBasicFolder };
        await config.update(batariBasicCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }
    // Set
    await context.globalState.update(transferedFolderToCustomFoldersKey, true);
}
async function ValidateCustomFoldersConfigurationEntry(event) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // 7800basic?
    if (event.affectsConfiguration(`${application.Name}.${seventyEightHundredCustomFoldersSection}`)) {
        await sanitizeCustomFoldersEntry(seventyEightHundredCustomFoldersSection, config);
    }
    ;
    // batariBasic?
    if (event.affectsConfiguration(`${application.Name}.${batariBasicCustomFoldersSection}`)) {
        await sanitizeCustomFoldersEntry(batariBasicCustomFoldersSection, config);
    }
    ;
}
async function sanitizeCustomFoldersEntry(section, config) {
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
        await config.update(section, updated, vscode.ConfigurationTarget.Global);
    }
}
async function ValidateOpenSamplesFileOnRestart(context) {
    // Prepare
    const openSampleFileOnRestartKey = `${application.Name}.configuration.openSampleFileOnRestart`;
    // Process?
    const sampleFilePath = context.globalState.get(`${application.Name}.configuration.openSampleFileOnRestart`);
    if (!sampleFilePath)
        return;
    // Yes! Open the file
    try {
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(sampleFilePath));
        await vscode.window.showTextDocument(document, { preview: false, preserveFocus: true });
    }
    catch (error) {
        // log or ignore — keep function resilient
    }
    // Clear
    await context.globalState.update(openSampleFileOnRestartKey, undefined);
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
function ContainsCustomCompilerTag(languageId, id) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Scan
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    const found = Object.entries(customFolders).find(([key]) => key.toLowerCase() === id.toLowerCase());
    // Return result
    return found ? true : false;
}
function CustomFolderExists(configurationSection, folder) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Scan and return result
    const customFolders = config.get(configurationSection, {});
    return Object.values(customFolders).some(value => value.toLowerCase() === folder.toLowerCase());
}
//# sourceMappingURL=configuration.js.map
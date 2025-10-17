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
// Keys
//export const OpenSampleFileOnRestartGlobalKey = `configuration.openSampleFileOnRestart`;
function GetAtariDevStudioConfiguration() {
    return vscode.workspace.getConfiguration(application.Name, null);
}
function GetChosenCompiler(document) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Find compiler (based on language of chosen file)
    for (const compiler of application.Compilers) {
        if (compiler.Id === document.languageId) {
            return compiler;
        }
    }
    // Activate output window?
    if (config.get(`editor.preserveCodeEditorFocus`)) {
        application.CompilerOutputChannel.show();
    }
    // Clear output content?
    if (config.get(`editor.clearPreviousOutput`)) {
        application.CompilerOutputChannel.clear();
    }
    // Not found
    return undefined;
}
function TransferFolderToCustomFolders(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate if we have already done it?
        const transferedFolderToCustomFolders = context.globalState.get(`${application.Name}.configuration.transferedFolderToCustomFolders`, false);
        if (transferedFolderToCustomFolders)
            return;
        // Prepare
        const config = GetAtariDevStudioConfiguration();
        // 7800basic
        const existing7800BasicCustomFolder = config.get('compiler.7800basic.folder', null);
        if (existing7800BasicCustomFolder && !CustomFolderExists(`compiler.${application.SeventyEightHundredBasicLanguageId}.customFolders`, existing7800BasicCustomFolder)) {
            // Add
            const customFolder = { 'Custom': existing7800BasicCustomFolder };
            yield config.update(`compiler.${application.SeventyEightHundredBasicLanguageId}.customFolders`, customFolder, vscode.ConfigurationTarget.Global);
        }
        // batariBasic
        const existingBatariBasicFolder = config.get('compiler.batariBasic.folder', null);
        if (existingBatariBasicFolder && !CustomFolderExists(`compiler.${application.BatariBasicLanguageId}.customFolders`, existingBatariBasicFolder)) {
            // Add
            const customFolder = { 'Custom': existingBatariBasicFolder };
            yield config.update(`compiler.${application.BatariBasicLanguageId}.customFolders`, customFolder, vscode.ConfigurationTarget.Global);
        }
        // Set
        yield context.globalState.update(`${application.Name}.configuration.transferedFolderToCustomFolders`, true);
    });
}
function ValidateCustomFoldersConfigurationEntry(event) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        const config = GetAtariDevStudioConfiguration();
        // 7800basic?
        if (event.affectsConfiguration(`${application.Name}.compiler.${application.SeventyEightHundredBasicLanguageId}.customFolders`)) {
            // Prepare
            const customFolders = config.get(`compiler.${application.SeventyEightHundredBasicLanguageId}.customFolders`, {});
            const updatedCustomFolders = {};
            let isChanged = false;
            // Validate for spaces in Key and remove
            for (const [key, value] of Object.entries(customFolders)) {
                // Check key for required changes
                const newKey = key.includes(' ') ? key.replace(/ /g, '').trim() : key;
                if (newKey !== key) {
                    isChanged = true;
                }
                updatedCustomFolders[newKey] = value;
            }
            // Changed?
            if (isChanged) {
                yield config.update(`compiler.${application.SeventyEightHundredBasicLanguageId}.customFolders`, updatedCustomFolders, vscode.ConfigurationTarget.Global);
            }
        }
        ;
        // batariBasic?
        if (event.affectsConfiguration(`${application.Name}.compiler.${application.BatariBasicLanguageId}.customFolders`)) {
            // Prepare
            let customFolders = config.get(`compiler.${application.BatariBasicLanguageId}.customFolders`, {});
            const updatedCustomFolders = {};
            let isChanged = false;
            // Validate for spaces in Key and remove
            for (const [key, value] of Object.entries(customFolders)) {
                // Check key for required changes
                const newKey = key.includes(' ') ? key.replace(/ /g, '').trim() : key;
                if (newKey !== key) {
                    isChanged = true;
                }
                updatedCustomFolders[newKey] = value;
            }
            // Changed?
            if (isChanged) {
                yield config.update(`compiler.${application.BatariBasicLanguageId}.customFolders`, updatedCustomFolders, vscode.ConfigurationTarget.Global);
            }
        }
        ;
    });
}
function ValidateOpenSamplesFileOnRestart(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Process?
        const sampleFilePath = context.globalState.get(`${application.Name}.configuration.openSampleFileOnRestart`);
        if (!sampleFilePath)
            return;
        // Yes! Open the file
        yield vscode.workspace.openTextDocument(vscode.Uri.file(sampleFilePath))
            .then((document) => vscode.window.showTextDocument(document, { preview: false, preserveFocus: true }))
            .then(() => context.globalState.update(`${application.Name}.configuration.openSampleFileOnRestart`, undefined));
    });
}
function GetCustomCompilerIdList(languageId) {
    var _a;
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    // Get
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    const compilerIdList = (_a = Object.keys(customFolders)) !== null && _a !== void 0 ? _a : [];
    // Return
    return compilerIdList;
}
function GetCustomCompilerFolder(languageId, id) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    let folder = '';
    // Scan
    for (const [key, value] of Object.entries(customFolders)) {
        if (key.toLowerCase() === id.toLowerCase()) {
            folder = value;
            break;
        }
    }
    // Return result
    return folder;
}
function CustomFolderExists(configurationSection, folder) {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    const customFolders = config.get(configurationSection, {});
    let result = false;
    // Scan
    for (const [key, value] of Object.entries(customFolders)) {
        if (value.toLowerCase() === folder.toLowerCase()) {
            result = true;
            break;
        }
    }
    // Return result
    return result;
}
//# sourceMappingURL=configuration.js.map
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
exports.TransferFolderToCustomFolders = TransferFolderToCustomFolders;
exports.GetCustomCompilerIdList = GetCustomCompilerIdList;
exports.GetCustomCompilerPath = GetCustomCompilerPath;
const vscode = require("vscode");
const application = require("./application");
function TransferFolderToCustomFolders(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate if we have already done it?
        const transferedFolderToCustomFolders = context.globalState.get(`${application.Name}.configuration.transferedFolderToCustomFolders`, false);
        if (transferedFolderToCustomFolders)
            return;
        // Prepare
        const config = vscode.workspace.getConfiguration(application.Name);
        // 7800basic
        const existing7800BasicCustomFolder = config.get('compiler.7800basic.folder', null);
        if (existing7800BasicCustomFolder) {
            // Add
            const customFolder = { 'Custom': existing7800BasicCustomFolder };
            yield config.update('compiler.7800basic.customFolders', customFolder, vscode.ConfigurationTarget.Global);
        }
        // batariBasic
        const existingBatariBasicFolder = config.get('compiler.batariBasic.folder', null);
        if (existingBatariBasicFolder) {
            // Add
            const customFolder = { 'Custom': existingBatariBasicFolder };
            yield config.update('compiler.batariBasic.customFolders', customFolder, vscode.ConfigurationTarget.Global);
        }
        // Set
        yield context.globalState.update(`${application.Name}.configuration.transferedFolderToCustomFolders`, true);
    });
}
function GetCustomCompilerIdList(languageId) {
    var _a;
    // Prepare
    const config = vscode.workspace.getConfiguration(application.Name);
    // Get
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    const compilerIdList = (_a = Object.keys(customFolders)) !== null && _a !== void 0 ? _a : [];
    // Return
    return compilerIdList;
}
function GetCustomCompilerPath(languageId, compilerId) {
    // Prepare
    const config = vscode.workspace.getConfiguration(application.Name);
    const customFolders = config.get(`compiler.${languageId}.customFolders`, {});
    let path = '';
    // Scan
    for (const [key, value] of Object.entries(customFolders)) {
        if (key.toLowerCase() === compilerId.toLowerCase()) {
            path = value;
            break;
        }
    }
    // Return result
    return path;
}
//# sourceMappingURL=configuration.js.map
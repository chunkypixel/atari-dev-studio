"use strict";
import * as vscode from 'vscode';
import * as application from './application';

export async function TransferFolderToCustomFolders(context: vscode.ExtensionContext): Promise<void> {
    // Validate if we have already done it?
    const transferedFolderToCustomFolders = context.globalState.get(`${application.Name}.configuration.transferedFolderToCustomFolders`,false);
    if (transferedFolderToCustomFolders) return;

    // Prepare
    const config = vscode.workspace.getConfiguration(application.Name);

    // 7800basic
    const existing7800BasicCustomFolder = config.get('compiler.7800basic.folder',null);
    if (existing7800BasicCustomFolder) {
        // Add
        const customFolder = {'Custom': existing7800BasicCustomFolder};
        await config.update('compiler.7800basic.customFolders', customFolder, vscode.ConfigurationTarget.Global);
    }

    // batariBasic
    const existingBatariBasicFolder = config.get('compiler.batariBasic.folder',null);
    if (existingBatariBasicFolder) {
        // Add
        const customFolder = {'Custom': existingBatariBasicFolder}; 
        await config.update('compiler.batariBasic.customFolders', customFolder, vscode.ConfigurationTarget.Global);
    }

    // Set
    await context.globalState.update(`${application.Name}.configuration.transferedFolderToCustomFolders`, true)
}

export function GetCustomCompilerIdList(languageId: string): string[] {
    // Prepare
    const config = vscode.workspace.getConfiguration(application.Name);

    // Get
    const customFolders = config.get<Record<string,string>>(`compiler.${languageId}.customFolders`,{});
    const compilerIdList = Object.keys(customFolders) ?? [];
    
    // Return
    return compilerIdList;
}

export function GetCustomCompilerPath(languageId: string, compilerId: string): string {
    // Prepare
    const config = vscode.workspace.getConfiguration(application.Name);
    const customFolders = config.get<Record<string, string>>(`compiler.${languageId}.customFolders`,{});
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
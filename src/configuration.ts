"use strict";
import * as vscode from 'vscode';
import * as application from './application';

const seventyEightHundredCustomFoldersSection = 'compiler.7800basic.customFolders';
const batariBasicCustomFoldersSection = 'compiler.batariBasic.customFolders';

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
        await config.update(seventyEightHundredCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }

    // batariBasic
    const existingBatariBasicFolder = config.get('compiler.batariBasic.folder',null);
    if (existingBatariBasicFolder) {
        // Add
        const customFolder = {'Custom': existingBatariBasicFolder}; 
        await config.update(batariBasicCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
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

export async function ValidateCustomFoldersConfigurationEntry(event: vscode.ConfigurationChangeEvent): Promise<void> {
    // Prepare
    const config = vscode.workspace.getConfiguration(application.Name);

    // 7800basic?
    if (event.affectsConfiguration(`${application.Name}.${seventyEightHundredCustomFoldersSection}`)) {
        // Prepare
        const customFolders = config.get<Record<string, string>>(seventyEightHundredCustomFoldersSection,{});
        const updatedCustomFolders: Record<string, string> = {};
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
            await config.update(seventyEightHundredCustomFoldersSection, updatedCustomFolders, vscode.ConfigurationTarget.Global);
        }

    }
    
    // batari Basic
    if (event.affectsConfiguration(`${application.Name}.${batariBasicCustomFoldersSection}`)) {
        // Prepare
        let customFolders = config.get<Record<string, string>>(batariBasicCustomFoldersSection,{});
        const updatedCustomFolders: Record<string, string> = {};
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
            await config.update(batariBasicCustomFoldersSection, updatedCustomFolders, vscode.ConfigurationTarget.Global);
        }

    };
}
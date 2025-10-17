"use strict";
import * as vscode from 'vscode';
import * as application from './application';
import * as compiler from './compilers/compilerBase'


const seventyEightHundredCustomFoldersSection = 'compiler.7800basic.customFolders';
const batariBasicCustomFoldersSection = 'compiler.batariBasic.customFolders';

export function GetAtariDevStudioConfiguration() : vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(application.Name, null);
}

export function GetChosenCompiler(document: vscode.TextDocument): compiler.CompilerBase | undefined {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // Find compiler (based on language of chosen file)
    for (const compiler of application.Compilers) {
        if (compiler.Id === document.languageId) {
            return compiler;
        }
    }	

    // Activate output window?
    if (config!.get<boolean>(`editor.preserveCodeEditorFocus`))  {
        application.CompilerOutputChannel.show();
    }

    // Clear output content?
    if (config!.get<boolean>(`editor.clearPreviousOutput`))  {
        application.CompilerOutputChannel.clear();
    }

    // Not found
    return undefined;
}

export async function TransferFolderToCustomFolders(context: vscode.ExtensionContext): Promise<void> {
    // Validate if we have already done it?
    const transferedFolderToCustomFolders = context.globalState.get(`${application.Name}.configuration.transferedFolderToCustomFolders`,false);
    if (transferedFolderToCustomFolders) return;

    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // 7800basic
    const existing7800BasicCustomFolder = config.get('compiler.7800basic.folder',null);
    if (existing7800BasicCustomFolder && !CustomFolderExists(seventyEightHundredCustomFoldersSection, existing7800BasicCustomFolder)) {
        // Add
        const customFolder = {'Custom': existing7800BasicCustomFolder};
        await config.update(seventyEightHundredCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }

    // batariBasic
    const existingBatariBasicFolder = config.get('compiler.batariBasic.folder',null);
    if (existingBatariBasicFolder && !CustomFolderExists(batariBasicCustomFoldersSection, existingBatariBasicFolder)) {
        // Add
        const customFolder = {'Custom': existingBatariBasicFolder}; 
        await config.update(batariBasicCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }

    // Set
    await context.globalState.update(`${application.Name}.configuration.transferedFolderToCustomFolders`, true)
}

export async function ValidateCustomFoldersConfigurationEntry(event: vscode.ConfigurationChangeEvent): Promise<void> {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

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
    };
    
    // batariBasic?
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

export async function ValidateOpenSamplesFileOnRestart(context: vscode.ExtensionContext): Promise<void> {
    // Process?
    const sampleFilePath: string | undefined = context.globalState.get(`${application.Name}.configuration.openSampleFileOnRestart`);
    if (!sampleFilePath) return;

    // Yes! Open the file
    await vscode.workspace.openTextDocument(vscode.Uri.file(sampleFilePath))
        .then((document: vscode.TextDocument) => vscode.window.showTextDocument(document, {preview: false, preserveFocus: true}))
        .then(() => context.globalState.update(`${application.Name}.configuration.openSampleFileOnRestart`, undefined));
}

export function GetCustomCompilerIdList(languageId: string): string[] {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // Get
    const customFolders = config.get<Record<string,string>>(`compiler.${languageId}.customFolders`,{});
    const compilerIdList = Object.keys(customFolders) ?? [];
    
    // Return
    return compilerIdList;
}

export function GetCustomCompilerFolder(languageId: string, id: string): string {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    let folder = '';

    // Scan
    const customFolders = config.get<Record<string, string>>(`compiler.${languageId}.customFolders`,{});
    for (const [key, value] of Object.entries(customFolders)) {
        if (key.toLowerCase() === id.toLowerCase()) {
            folder = value;
            break;
        }
    }

    // Return result
    return folder;
}

function CustomFolderExists(configurationSection: string, folder: string): boolean {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    let result = false;

    // Scan
    const customFolders = config.get<Record<string, string>>(configurationSection,{});
    for (const [key, value] of Object.entries(customFolders)) {
        if (value.toLowerCase() === folder.toLowerCase()) {
            result = true;
            break;
        }
    }

    // Return result
    return result;
}
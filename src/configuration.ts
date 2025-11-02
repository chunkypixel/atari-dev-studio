"use strict";
import * as vscode from 'vscode';
import * as application from './application';
import * as compiler from './compilers/compilerBase'

const seventyEightHundredCustomFoldersSection = 'compiler.7800basic.customFolders';
const batariBasicCustomFoldersSection = 'compiler.batariBasic.customFolders';

export function GetAtariDevStudioConfiguration() : vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(application.Name);
}

export function GetChosenCompiler(document: vscode.TextDocument): compiler.CompilerBase | undefined {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    const editorConfig = vscode.workspace.getConfiguration('editor');

    // Find compiler (based on language of chosen file)
    const foundCompiler = application.Compilers.find(c => c.Id === document.languageId);
    if (foundCompiler) return foundCompiler;

    // Activate output window?
    if (editorConfig.get<boolean>('preserveCodeEditorFocus', false)) {
        application.CompilerOutputChannel.show();
    }

    // Clear output content?
    if (editorConfig.get<boolean>('clearPreviousOutput', false)) {
        application.CompilerOutputChannel.clear();
    }

    // No result
    return undefined;
}

export async function TransferFolderToCustomFolders(context: vscode.ExtensionContext): Promise<void> {
    // Prepare
    const config = GetAtariDevStudioConfiguration();
    const transferedFolderToCustomFoldersKey = `${application.Name}.configuration.transferedFolderToCustomFolders`;

    // Validate if we have already done it?
    const transferedFolderToCustomFolders = context.globalState.get<boolean>(transferedFolderToCustomFoldersKey,false);
    if (transferedFolderToCustomFolders) return;

    // 7800basic
    const existing7800BasicCustomFolder = config.get<string | null>('compiler.7800basic.folder',null);
    if (existing7800BasicCustomFolder && !CustomFolderExists(seventyEightHundredCustomFoldersSection, existing7800BasicCustomFolder)) {
        // Add
        const customFolder: Record<string, string> = {'Custom': existing7800BasicCustomFolder};
        await config.update(seventyEightHundredCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }

    // batariBasic
    const existingBatariBasicFolder = config.get<string | null>('compiler.batariBasic.folder',null);
    if (existingBatariBasicFolder && !CustomFolderExists(batariBasicCustomFoldersSection, existingBatariBasicFolder)) {
        // Add
        const customFolder: Record<string, string> = {'Custom': existingBatariBasicFolder}; 
        await config.update(batariBasicCustomFoldersSection, customFolder, vscode.ConfigurationTarget.Global);
    }

    // Set
    await context.globalState.update(transferedFolderToCustomFoldersKey, true)
}

export async function ValidateCustomFoldersConfigurationEntry(event: vscode.ConfigurationChangeEvent): Promise<void> {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // 7800basic?
    if (event.affectsConfiguration(`${application.Name}.${seventyEightHundredCustomFoldersSection}`)) {
        await sanitizeCustomFoldersEntry(seventyEightHundredCustomFoldersSection, config);
    };
    
    // batariBasic?
    if (event.affectsConfiguration(`${application.Name}.${batariBasicCustomFoldersSection}`)) {
        await sanitizeCustomFoldersEntry(batariBasicCustomFoldersSection, config);
    };
}

async function sanitizeCustomFoldersEntry(section: string, config: vscode.WorkspaceConfiguration): Promise<void> {
    // Prepare
    const customFolders = config.get<Record<string, string>>(section, {});
    const updated: Record<string, string> = {};
    let isChanged = false;

    // Validate for spaces in Key and remove
    for (const [key, value] of Object.entries(customFolders)) {
        const newKey = key.replace(/\s+/g, '').trim();
        if (newKey !== key) isChanged = true;
        updated[newKey] = value;
    }

    // Changed?
    if (isChanged) {
        await config.update(section, updated, vscode.ConfigurationTarget.Global);
    }
}

export async function ValidateOpenSamplesFileOnRestart(context: vscode.ExtensionContext): Promise<void> {
    // Prepare
    const openSampleFileOnRestartKey = `${application.Name}.configuration.openSampleFileOnRestart`;

    // Process?
    const sampleFilePath = context.globalState.get<string | undefined>(`${application.Name}.configuration.openSampleFileOnRestart`);
    if (!sampleFilePath) return;

    // Yes! Open the file
    try {
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(sampleFilePath));
        await vscode.window.showTextDocument(document, { preview: false, preserveFocus: true });
    } catch (error) {
        // log or ignore — keep function resilient
    }

    // Clear
    await context.globalState.update(openSampleFileOnRestartKey, undefined);
}

export function GetCustomCompilerIdList(languageId: string): string[] {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // Get and return result
    const customFolders = config.get<Record<string,string>>(`compiler.${languageId}.customFolders`,{});
    return Object.keys(customFolders);
}

export function GetCustomCompilerFolder(languageId: string, id: string): string {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // Scan
    const customFolders = config.get<Record<string, string>>(`compiler.${languageId}.customFolders`,{});
    const found = Object.entries(customFolders).find(([key]) => key.toLowerCase() === id.toLowerCase());

    // Return result
    return found ? found[1] : '';
}

export function ContainsCustomCompilerTag(languageId: string, id: string): boolean {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

        // Scan
    const customFolders = config.get<Record<string, string>>(`compiler.${languageId}.customFolders`,{});
    const found = Object.entries(customFolders).find(([key]) => key.toLowerCase() === id.toLowerCase());

    // Return result
    return found ? true : false;
}

function CustomFolderExists(configurationSection: string, folder: string): boolean {
    // Prepare
    const config = GetAtariDevStudioConfiguration();

    // Scan and return result
    const customFolders = config.get<Record<string, string>>(configurationSection,{});
    return Object.values(customFolders).some(value => value.toLowerCase() === folder.toLowerCase());
}


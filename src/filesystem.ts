"use strict";
import * as vscode from 'vscode';
import * as fs from 'fs';

export async function GetFileUriAsync(fileUri: vscode.Uri): Promise<vscode.Uri> {
	// Validate
	if (fileUri) return fileUri;

	// Prepare
	let document: vscode.TextDocument;

	// Document not open?
	// Note: this really shouldn't happen
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		document = await vscode.workspace.openTextDocument(fileUri);
	} else {
		document = editor.document;
	}

	// Result
	return document!.uri;
}

export async function GetDocumentAsync(fileUri: vscode.Uri): Promise<vscode.TextDocument | null> {
    // Validate
    if (IsRunFromExplorer(fileUri)) {
        // Make sure document exists
        if (FileExists(fileUri.fsPath)) return await vscode.workspace.openTextDocument(fileUri);
        vscode.window.showInformationMessage("Error: File cannot be found");
    }

	// Try current document
    let editor = vscode.window.activeTextEditor
    if (editor) return editor.document;
    return null;
}

export function IsRunFromExplorer(fileUri: vscode.Uri): boolean {
    let editor = vscode.window.activeTextEditor;
    if (!fileUri || !fileUri.fsPath) {
        return false;
    }
    if (!editor) {
        return true;
    }
    if (fileUri.fsPath === editor.document.uri.fsPath) {
        return false;
    }
    return true;
}

export function FileExists(path: string): Promise<boolean> {
    console.log('debugger:filesystem.FileExists');

    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });
}

export function FolderExists(folder: string): Promise<boolean> {
    console.log('debugger:filesystem.FolderExists');

    return new Promise((resolve, reject) => {
        fs.access(folder, fs.constants.F_OK, err => {
            resolve(!err);
        });
    });        
}

export function SetChMod(path: string, mode: string = '777'): Promise<boolean> {
    console.log('debugger:filesystem.SetChMod');

    return new Promise((resolve, reject) => {
        fs.chmod(path, mode, err => {
            if (err) { console.log(`- failed to set chmod permissions: ${err.message}`)}
            resolve(!err);
        });
    }); 
}

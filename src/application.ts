"use strict";
import * as vscode from 'vscode';

export const ExtensionId = "chunkypixel.atari-dev-studio";

export function Path(): string {
	// Attempt to read
	try {
		return vscode.extensions.getExtension(ExtensionId)!.extensionPath;
	} catch (error) {
	} 
	return "unknown";
}

export function Version() {
	// Attempt to read
	try {
		return `v${vscode.extensions.getExtension(ExtensionId)!.packageJSON.version}`;
	} catch (error) {
	}	
	return "unknown";
}

export function DisplayName(): string {
	// Attempt to read
	try {
		return vscode.extensions.getExtension(ExtensionId)!.packageJSON.displayName;
	} catch (error) {
	} 
	return "unknown";
}

export function Description(): string {
	// Attempt to read
	try {
		return vscode.extensions.getExtension(ExtensionId)!.packageJSON.description;
	} catch (error) {
	}  
	return "unknown";
}

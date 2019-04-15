"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from './filesystem';
const os = require("os");
import { CompilerBase } from './compilers/compilerBase';
import { BatariBasicCompiler } from './compilers/batariBasicCompiler';
import { SeventyEightHundredBasicCompiler } from './compilers/seventyEightHundredBasicCompiler';
import { DasmCompiler } from './compilers/dasmCompiler';


// -------------------------------------------------------------------------------------
// Compilers
// Register compilers here and in order of preference
// -------------------------------------------------------------------------------------
export const Compilers:CompilerBase[] = [
	new BatariBasicCompiler(),
	new SeventyEightHundredBasicCompiler(),
	new DasmCompiler()
];

// -------------------------------------------------------------------------------------
// Operating System
// -------------------------------------------------------------------------------------
export function OSPlatform() { return os.platform(); }
export function OsArch() { return os.arch(); }
export function IsWindows() { return os.platform() === 'win32'; }
export function IsLinux() { return os.platform() === 'linux'; }
export function IsMacOS() { return os.platform() === 'darwin'; }
export function Is32Bit() { return os.arch() === 'x32'; }
export function Is64Bit() { return os.arch() === 'x64'; }

// -------------------------------------------------------------------------------------
// Extension
// -------------------------------------------------------------------------------------
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

export async function BuildGameAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Get file extension to determine compiler
	fileUri = await filesystem.GetFileUri(fileUri);
	if (!fileUri) return false;

	// Find compiler
	let fileExtension = path.extname(fileUri.fsPath).toLowerCase();
	for (const compiler of Compilers) {
		if (compiler.CompilerExtensions.includes(fileExtension)) {
			return await compiler.BuildGameAsync(fileUri);
		}
	}

	// Not found
	let message = `Unable to find a compiler for extension ${fileExtension}.`;
	vscode.window.showErrorMessage(message);
	console.log(message)
	return false;
}

export async function BuildGameAndRunAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Get file extension to determine compiler
	fileUri = await filesystem.GetFileUri(fileUri);
	if (!fileUri) return false;

	// Find compiler
	let fileExtension = path.extname(fileUri.fsPath).toLowerCase();
	for (const compiler of Compilers) {
		if (compiler.CompilerExtensions.includes(fileExtension)) {
			return await compiler.BuildGameAndRunAsync(fileUri);
		}
	}

	// Not found
	let message = `Unable to find a compiler for extension ${fileExtension}.`;
	vscode.window.showErrorMessage(message);
	console.log(message)
	return false;
}
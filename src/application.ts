"use strict";
import * as vscode from 'vscode';
import * as path from 'path';
import * as filesystem from './filesystem';
const os = require("os");
import { CompilerBase } from './compilers/compilerBase';
import { BatariBasicCompiler } from './compilers/batariBasicCompiler';
import { SeventyEightHundredBasicCompiler } from './compilers/seventyEightHundredBasicCompiler';
import { DasmCompiler } from './compilers/dasmCompiler';

export const ExtensionId = "chunkypixel.atari-dev-studio";

export const Path: string = vscode.extensions.getExtension(ExtensionId)!.extensionPath;
export const Version: string = vscode.extensions.getExtension(ExtensionId)!.packageJSON.version;
export const DisplayName: string = vscode.extensions.getExtension(ExtensionId)!.packageJSON.displayName;
export const Description: string = vscode.extensions.getExtension(ExtensionId)!.packageJSON.description;

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
// Functions
// -------------------------------------------------------------------------------------
export async function BuildGameAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Get document
	let document = await filesystem.GetDocumentAsync(fileUri);
	if (!document) return false;

	// Find compiler
	let fileExtension = path.extname(document.uri.fsPath).toLowerCase();
	for (const compiler of Compilers) {
		if (compiler.CompilerExtensions.includes(fileExtension)) {
			return await compiler.BuildGameAsync(document);
		}
	}

	// Not found
	let message = `Unable to find a compiler for extension ${fileExtension}.`;
	vscode.window.showErrorMessage(message);
	console.log(message)
	return false;
}

export async function BuildGameAndRunAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Get document
	let document = await filesystem.GetDocumentAsync(fileUri);
	if (!document) return false;

	// Find compiler
	let fileExtension = path.extname(document.uri.fsPath).toLowerCase();
	for (const compiler of Compilers) {
		if (compiler.CompilerExtensions.includes(fileExtension)) {
			return await compiler.BuildGameAndRunAsync(document);
		}
	}

	// Not found
	let message = `Unable to find a compiler for extension ${fileExtension}.`;
	vscode.window.showErrorMessage(message);
	console.log(message)
	return false;
}
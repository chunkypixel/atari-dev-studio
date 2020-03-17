"use strict";
import * as vscode from 'vscode';
import * as filesystem from './filesystem';
const os = require("os");
import { CompilerBase } from './compilers/compilerBase';
import { BatariBasicCompiler } from './compilers/batariBasicCompiler';
import { SeventyEightHundredBasicCompiler } from './compilers/seventyEightHundredBasicCompiler';
import { DasmCompiler } from './compilers/dasmCompiler';
import { MakeCompiler } from './compilers/makeCompiler';
import { EmulatorBase } from './emulators/emulatorBase';
import { StellaEmulator } from './emulators/stellaEmulator';
import { A7800Emulator } from './emulators/a7800Emulator';
import { HoverBase } from './hovers/hoverBase';
import { DasmHover } from './hovers/dasmHover';
import { BatariBasicHover } from './hovers/batariBasicHover';
import { SeventyEightHundredBasicHover } from './hovers/seventyEightHundredBasicHover';
import { CompletionBase } from './completions/completionBase';
import { SeventyEightHundredBasicCompletion } from './completions/seventyEightHundredBasicCompletion';
import { FoldingBase } from './foldings/foldingBase';
import { BatariBasicFolding } from './foldings/batariBasicFolding';
import { SeventyEightHundredBasicFolding } from './foldings/seventyEightHundredBasicFolding';

// -------------------------------------------------------------------------------------
// Operating System
// -------------------------------------------------------------------------------------
export const OSPlatform: any = os.platform();
export const OSArch: any = os.arch();
export const IsWindows: boolean = (os.platform() === 'win32');
export const IsLinux: boolean = (os.platform() === 'linux');
export const IsMacOS: boolean = (os.platform() === 'darwin');
export const Is32Bit: boolean = (os.arch() === 'x32');
export const Is64Bit: boolean = (os.arch() === 'x64');

// -------------------------------------------------------------------------------------
// Extension
// -------------------------------------------------------------------------------------
export const Id = "chunkypixel.atari-dev-studio";
export const Path: string = vscode.extensions.getExtension(Id)!.extensionPath;
export const Name: string = vscode.extensions.getExtension(Id)!.packageJSON.name;
export const Publisher: string = vscode.extensions.getExtension(Id)!.packageJSON.publisher;
export const Version: string = vscode.extensions.getExtension(Id)!.packageJSON.version;
export const DisplayName: string = vscode.extensions.getExtension(Id)!.packageJSON.displayName;
export const Description: string = vscode.extensions.getExtension(Id)!.packageJSON.description;
export const PreferencesSettingsExtensionPath: string = `${(IsMacOS ? "Code" : "File")} -> Preferences -> Settings -> Extensions -> ${DisplayName}`;
export const ChangeLogUri: vscode.Uri = vscode.Uri.parse(`https://marketplace.visualstudio.com/items/${Id}/changelog`);

// -------------------------------------------------------------------------------------
// Channels
// -------------------------------------------------------------------------------------
export const CompilerOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("Compiler"); 

// -------------------------------------------------------------------------------------
// Terminal
// -------------------------------------------------------------------------------------
export let MakeTerminal: vscode.Terminal | undefined;

export async function InitialiseMakeTerminalAsync() {
	// Kill existing terminal?
	MakeTerminal?.dispose();
	
	// Create
	MakeTerminal = vscode.window.createTerminal("Make");
}

// -------------------------------------------------------------------------------------
// Compilers
// Register compilers here and in order of preference
// -------------------------------------------------------------------------------------
export const Compilers:CompilerBase[] = [
	new BatariBasicCompiler(),
	new SeventyEightHundredBasicCompiler(),
	new DasmCompiler(),
	new MakeCompiler()
];

// -------------------------------------------------------------------------------------
// Emulators
// Register emulators here and in order of preference
// -------------------------------------------------------------------------------------
export const Emulators:EmulatorBase[] = [
	new StellaEmulator(),
	new A7800Emulator()
];

// -------------------------------------------------------------------------------------
// Hovers
// Language tooltips
// -------------------------------------------------------------------------------------
export const Hovers:HoverBase[] = [
	new DasmHover(),
	new BatariBasicHover(),
	new SeventyEightHundredBasicHover()
];

export async function RegisterHoverProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (let hover of Hovers) {
		await hover.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// Completion
// Language intellisense
// -------------------------------------------------------------------------------------

export const Completions:CompletionBase[] = [
	new SeventyEightHundredBasicCompletion()
];

export async function RegisterCompletionProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (let completion of Completions) {
		await completion.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// Region Folding
// Language intellisense
// -------------------------------------------------------------------------------------

export const Foldings:FoldingBase[] = [
	new BatariBasicFolding(),
	new SeventyEightHundredBasicFolding()
];

export async function RegisterFoldingProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (let folding of Foldings) {
		await folding.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------
export async function BuildGameAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Get document
	let document = await filesystem.GetDocumentAsync(fileUri);
	if (!document || document!.uri.scheme !== "file") { return false; }

	// Find compiler
	let compiler = getChosenCompiler(document);
	if (compiler) { return await compiler.BuildGameAsync(document); }

	// Result
	return false;
}

export async function BuildGameAndRunAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Get document
	let document = await filesystem.GetDocumentAsync(fileUri);
	if (!document || document!.uri.scheme !== "file") { return false; }

	// Find compiler
	let compiler = getChosenCompiler(document);
	if (compiler) { return await compiler.BuildGameAndRunAsync(document); }

	// Result
	return false;
}

export function KillBuildGame(): void {
	// Process all compilers
	for (let compiler of Compilers) {
		if (compiler.IsRunning) {
			compiler.Kill();
		}
	}		
}

export function Notify(message: string): void {
	CompilerOutputChannel.appendLine(message);
	console.log(`debugger:${message}`);        
}

export function GetConfiguration() : vscode.WorkspaceConfiguration {
	return vscode.workspace.getConfiguration(Name, null);
}

function getChosenCompiler(document: vscode.TextDocument): CompilerBase | undefined {
	// Prepare
	let configuration = GetConfiguration();

	// // Find compiler (based on configuration selection)
	// let chosenCompiler = configuration.get<string>(`compilation.defaultCompiler`);
	// if (chosenCompiler) {
	// 	for (let compiler of Compilers) {
	// 		if (compiler.Id === chosenCompiler || compiler.Name === chosenCompiler) {
	// 			return compiler;
	// 		}
	// 	}	
	// }

	// Find compiler (based on language of chosen file)
	for (let compiler of Compilers) {
		if (compiler.Id === document.languageId) {
			return compiler;
		}
	}	

	// // Find compiler (based on extension)
	// let fileExtension = path.extname(document.uri.fsPath).toLowerCase();
	// for (let compiler of Compilers) {
	// 	if (compiler.Extensions.includes(fileExtension)) {
	// 		return compiler;
	// 	}
	// }	

	// Activate output window?
	if (configuration!.get<boolean>(`editor.preserveCodeEditorFocus`))  {
		CompilerOutputChannel.show();
	}

	// Clear output content?
	if (configuration!.get<boolean>(`editor.clearPreviousOutput`))  {
		CompilerOutputChannel.clear();
	}

	// Not found
	//Notify(`Unable to determine a compiler to use based on your chosen default compiler '${chosenCompiler}'. Review your selection in ${PreferencesSettingsExtensionPath}.`);

	// Not found
	return undefined;
}

export async function ShowStartupMessagesAsync(): Promise<void> {
	// Prepare
	let configuration = GetConfiguration();

	// Load settings
	let showNewVersionMessage = configuration.get<string>(`application.configuration.showNewVersionMessage`);
	let latestVersion = configuration.get<string>(`application.configuration.latestVersion`);

	// Process?
	if (!showNewVersionMessage || latestVersion === Version) { return; }

	// Update latest version
	configuration.update(`application.configuration.latestVersion`, Version, vscode.ConfigurationTarget.Global);

	// buttons
	let latestChanges = "Learn more about the latest changes";
	let dontShowMeThisMessage = "Don't show me this message again";

	// Show prompt
	await vscode.window.showInformationMessage(`Welcome to the new version of ${DisplayName}`,
			latestChanges,dontShowMeThisMessage)
			.then(selection => {
				if (selection === undefined) {
					// Dismissed
				}
				else if (selection === latestChanges) {
					// Show changelog
					vscode.env.openExternal(ChangeLogUri);
				} 
				else if (selection = dontShowMeThisMessage) {
					// Disable
					configuration.update(`application.configuration.showNewVersionMessage`, false, vscode.ConfigurationTarget.Global);
				}
			});
}
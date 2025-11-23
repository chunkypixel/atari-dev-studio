"use strict";
import * as vscode from 'vscode';
import * as configuration from "./configuration";
import * as tags from "./tags";
import { CompilerBase } from './compilers/compilerBase';
import { BatariBasicCompiler } from './compilers/batariBasicCompiler';
import { SeventyEightHundredBasicCompiler } from './compilers/seventyEightHundredBasicCompiler';
import { DasmCompiler } from './compilers/dasmCompiler';
import { MakeCompiler } from './compilers/makeCompiler';
import { BatchCompiler } from './compilers/batchCompiler';
import { ShellScriptCompiler } from './compilers/shellScriptCompiler';
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
import { DocumentSymbolProviderBase } from './documentSymbolProvider/documentSymbolProviderBase';
import { SeventyEightHundredBasicDocumentSymbolProvider } from './documentSymbolProvider/seventyEightHundredBasicDocumentSymbolProvider';
import { BatariBasicDocumentSymbolProvider } from './documentSymbolProvider/batariBasicDocumentSymbolProvider';
import { DasmDocumentSymbolProvider } from './documentSymbolProvider/dasmDocumentSymbolProvider';
import { DefinitionProviderBase } from './definitionProvider/definitionProviderBase';
import { SeventyEightHundredBasicDefinitionProvider } from './definitionProvider/seventyEightHundredBasicDefinitionProvider';
import { BatariBasicDefinitionProvider } from './definitionProvider/batariBasicDefinitionProvider';
import { DasmDefinitionProvider } from './definitionProvider/dasmDefinitionProvider';
import { ReferenceProviderBase } from './referenceProvider/referenceProviderBase';
import { SeventyEightHundredBasicReferenceProvider } from './referenceProvider/seventyEightHundredBasicReferenceProvider';
import { BatariBasicReferenceProvider } from './referenceProvider/batariBasicReferenceProvider';
import { DasmReferenceProvider } from './referenceProvider/dasmReferenceProvider';
import { ContextHelpBase } from "./contexthelp/contextHelpBase";
import { SeventyEightHundredBasicContextHelp } from "./contexthelp/seventyEightHundredBasicContextHelp";
import { BatariBasicContextHelp } from "./contexthelp/batariBasicContextHelp";
import { SeventyEightHundredGDSerial } from './serial/SeventyEightHundredGDSerial';
import { SerialBase } from './serial/serialBase';
import { BatariBasicCompletion } from './completions/batariBasicCompletion';
import internal = require('stream');
const os = require("os");

// -------------------------------------------------------------------------------------
// Operating System
// -------------------------------------------------------------------------------------
export const OSPlatform: any = os.platform();
export const OSArch: any = os.arch();
export const OSRelease: any = os.release();
export const IsWindows: boolean = (os.platform() === 'win32');
export const IsLinux: boolean = (os.platform() === 'linux');
export const IsMacOS: boolean = (os.platform() === 'darwin');
export const Is32Bit: boolean = (os.arch() === 'x32');
export const Is64Bit: boolean = (os.arch() === 'x64');
export const IsMacOSArm: boolean = (os.platform() === 'darwin' && os.arch() === 'arm64')
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
// Environment
// -------------------------------------------------------------------------------------
export const EnvironmentSummary: string = `Operating System: ${(IsWindows ? "Windows" : IsLinux ? "Linux" : IsMacOS ? "MacOS" : "Unknown")} (${OSArch}), VSCode: v${vscode.version}, ${DisplayName}: v${Version}`;
export const SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE = 0.37;
export const BATARIBASIC_WASMTIME_RELEASE = 1.9;
export const AtariDevStudioCompilerWindowName = "ADS Compiler";
export const AtariDevStudioTerminalWindowName = "ADS Terminal";
// -------------------------------------------------------------------------------------
// Languages
// -------------------------------------------------------------------------------------
export const SeventyEightHundredBasicLanguageId = "7800basic";
export const BatariBasicLanguageId = "batariBasic";
// -------------------------------------------------------------------------------------
// Channels
// -------------------------------------------------------------------------------------
export const CompilerOutputChannel: vscode.OutputChannel = vscode.window.createOutputChannel(AtariDevStudioCompilerWindowName); 

// -------------------------------------------------------------------------------------
// Terminal
// Information:
// * https://code.visualstudio.com/updates/v1_49#_terminal-link-providers
//   we maybe able to capture output!!
// * https://github.com/microsoft/vscode-extension-samples/tree/master/terminal-sample
// * features
//   vscode.window.onDidWriteTerminalData
//   vscode.window.registerTerminalLinkProvider

// -------------------------------------------------------------------------------------
export let AdsTerminal: vscode.Terminal | undefined;

export async function InitialiseAdsTerminalAsync() {
	// Already have a terminal?
	if (AdsTerminal !== undefined && await AdsTerminal.processId) { 
		AdsTerminal?.show(true);
		return;
	}

	// Create
	if (IsWindows) {
		// For windows we need to create a CMD window
		// NOTE: by default VSCode uses powershell
		AdsTerminal = vscode.window.createTerminal({
			name: AtariDevStudioTerminalWindowName,
			shellPath: "C:\\Windows\\System32\\cmd.exe"
		});
	} else {
		// Let system choose
		AdsTerminal = vscode.window.createTerminal(AtariDevStudioTerminalWindowName);
	}

	// User closed a terminal? if so verify it's ours and clear the reference
	vscode.window.onDidCloseTerminal((terminal) => {
		if (terminal.name === Name) {
			AdsTerminal = undefined;
		}
	});

}

// -------------------------------------------------------------------------------------
// Compilers
// Register compilers here and in order of preference
// -------------------------------------------------------------------------------------
export const Compilers:CompilerBase[] = [
	new BatariBasicCompiler(),
	new SeventyEightHundredBasicCompiler(),
	new DasmCompiler(),
	new MakeCompiler(),
	new BatchCompiler(),
	new ShellScriptCompiler()
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
// Serial
// Language intellisense
// -------------------------------------------------------------------------------------
export const Serials:SerialBase[] = [
	new SeventyEightHundredGDSerial()
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
	for (const hover of Hovers) {
		await hover.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// Completion
// Language intellisense
// -------------------------------------------------------------------------------------
export const Completions:CompletionBase[] = [
	new SeventyEightHundredBasicCompletion(),
	new BatariBasicCompletion()
];

export async function RegisterCompletionProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (const completion of Completions) {
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
	for (const folding of Foldings) {
		await folding.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// DocumentSymbolProviders
// Language intellisense
// -------------------------------------------------------------------------------------
export const DocumentSymbolProviders:DocumentSymbolProviderBase[] = [
	new BatariBasicDocumentSymbolProvider(),
	new SeventyEightHundredBasicDocumentSymbolProvider(),
	new DasmDocumentSymbolProvider()
];

export async function RegisterDocumentSymbolProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (const documentSymbolProvider of DocumentSymbolProviders) {
		await documentSymbolProvider.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// DefinitionProviders
// Language intellisense
// -------------------------------------------------------------------------------------
export const DefinitionProviders:DefinitionProviderBase[] = [
	new BatariBasicDefinitionProvider(),
	new SeventyEightHundredBasicDefinitionProvider(),
	new DasmDefinitionProvider()
];

export async function RegisterDefinitionProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (const definitionProvider of DefinitionProviders) {
		await definitionProvider.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// ReferenceProviders
// Language intellisense
// -------------------------------------------------------------------------------------
export const ReferenceProviders:ReferenceProviderBase[] = [
	new BatariBasicReferenceProvider(),
	new SeventyEightHundredBasicReferenceProvider(),
	new DasmReferenceProvider()
];

export async function RegisterReferenceProvidersAsync(context: vscode.ExtensionContext): Promise<void> {
	for (const referenceProvider of ReferenceProviders) {
		await referenceProvider.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// ContextHelp
// Language intellisense
// -------------------------------------------------------------------------------------
export const ContextHelps:ContextHelpBase[] = [
	new BatariBasicContextHelp(),
	new SeventyEightHundredBasicContextHelp()
];

export async function RegisterContextHelpsAsync(context: vscode.ExtensionContext): Promise<void> {
	for (const contextHelp of ContextHelps) {
		await contextHelp.RegisterAsync(context);
	}
}

// -------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------
export async function BuildGameAsync(): Promise<boolean> {
	// Get document
	const document = await GetActiveTextEditorDocumentAsync();
	if (!document || document.uri.scheme !== "file") return false;

	// Find compiler
	let compiler = configuration.GetChosenCompiler(document);
	if (compiler) return await compiler.BuildGameAsync(document);

	// Result
	return false;
}

export async function BuildGameAndRunAsync(): Promise<boolean> {
	// Get document
	const document = await GetActiveTextEditorDocumentAsync();
	if (!document || document.uri.scheme !== "file") return false;

	// Find compiler
	let compiler = configuration.GetChosenCompiler(document);
	if (compiler) return await compiler.BuildGameAndRunAsync(document);

	// Result
	return false;
}

export async function LaunchBinaryFileTo7800GDAsync(fileUri: vscode.Uri): Promise<boolean> {
	// Validate
	if (!IsWindows) {
		// WINDOWS ONLY - Advise
		WriteToCompilerTerminal('Warning: Sending to 7800GD cart is currently only available for Windows.');

	} else {
		// Find
		var serial = Serials.find(s => s.Id === "7800GD");
		if (serial) {
			CompilerOutputChannel.clear();
			return await serial.SendGameAsync(fileUri.fsPath);
		}
	}

	// Result
	return false;
}

export function KillBuildGame(): void {
	// Process all compilers
	for (const compiler of Compilers) {
		if (compiler.IsRunning) compiler.Kill();
	}		
}

export async function OpenContextHelp(): Promise<void> {
	// Get active editor
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) return;
	
	// Find context help (based on language of chosen file)
    const contextHelp = ContextHelps.find(h => h.Id === activeEditor.document.languageId);
    if (!contextHelp) return;

	// Open at cursor position
    const position = activeEditor.selection.start;
    await contextHelp.OpenContextHelpAtCursorAsync(activeEditor.document, position);
}

export function WriteToCompilerTerminal(message: string = '', lineFeed: boolean = true, writeToLog: boolean = false): void {
	// Output
	if (lineFeed) {
		CompilerOutputChannel.appendLine(message)
	} else {
		CompilerOutputChannel.append(message);
	}
	// Write to log?
	if (writeToLog) console.log(`debugger:${message}`);   
}

export function WriteEnvironmentSummaryToCompilerTerminal(): void {
	// Write
	WriteToCompilerTerminal(EnvironmentSummary);
	WriteToCompilerTerminal();
}

export function ShowWarningPopup(message: string): void {
	vscode.window.showWarningMessage(message);
}

export function ShowInformationPopup(message: string): void {
	vscode.window.showInformationMessage(message);
}

export function ShowErrorPopup(message: string): void {
	vscode.window.showErrorMessage(message);
}

export async function ValidateOpenDocumentsOnStartup(context: vscode.ExtensionContext): Promise<void> {
	// Validate all open documents
	const openDocuments = vscode.workspace.textDocuments;
    for (const doc of openDocuments) {
		// Scan/process each existing open document
        tags.ScanDocumentForADSLanguageTag(doc);
    }
}

export async function ShowStartupMessages(context: vscode.ExtensionContext): Promise<void> {
	// Prepare
	const config = configuration.GetAtariDevStudioConfiguration();

	// Load settings
	const showNewVersionMessage = config.get<boolean>(`application.configuration.showNewVersionMessage`, true);
    const latestVersion = context.globalState.get(`${Name}.configuration.latestVersion`)

	// Process?
	if (!showNewVersionMessage || latestVersion === Version) return;

	// Set latest version
    await context.globalState.update(`${Name}.configuration.latestVersion`, Version);

	// buttons
	const latestChanges = "Learn more about the latest changes";
	const dontShowMeThisMessage = "Don't show me this message again";

	// Show prompt and validate
    const selection = await vscode.window.showInformationMessage(`Welcome to the new version of ${DisplayName}`, latestChanges, dontShowMeThisMessage);
    if (selection === latestChanges) {
        // Show changelog
        await vscode.env.openExternal(ChangeLogUri);
    } else if (selection === dontShowMeThisMessage) {
        // Disable (await to ensure persisted)
        await config.update(`application.configuration.showNewVersionMessage`, false, vscode.ConfigurationTarget.Global);
    }
}

export async function GetActiveTextEditorDocumentAsync(): Promise<vscode.TextDocument | null> {
    // Ensure coding area active before reading current document
    await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');

	// Try current document
    let editor = vscode.window.activeTextEditor;
    if (editor) return editor.document;

	// Nothing
    return null;
}

export function Delay(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

export function IsNumber(numStr: string) {
	return !isNaN(parseFloat(numStr)) && !isNaN(+numStr)
}

export function CountTrailingZeros(str: string): number {
	if (!str) return 0; // Handle empty string
	const match = str.match(/0+$/);
	return match ? match[0].length : 0;
}

export function TrimRight(str: string, length: number): string {
    if (length <= 0) return ''; // Handle invalid length
    return str.slice(-length); // Extract from end using negative index
}

export function TrimLeft(str: string, length: number): string {
    if (length <= 0) return ''; // Handle invalid length
    return str.slice(0, length); // Extract from start to length
}

export function ReplaceZerosTemplate(template: string, num: number): string {
    const numStr = num.toString();
    if (numStr.length > template.length) {
        return numStr; // If number is longer than template, return number as is
    }
    return template.slice(0, template.length - numStr.length) + numStr;
}

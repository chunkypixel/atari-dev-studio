// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as application from './application';
import { WelcomePage } from './pages/welcome';
import { SpriteEditorPage } from './pages/spriteeditor';
import './statusbar';

// Activation Events
// https://code.visualstudio.com/api/references/activation-events
// Activation will occur if a language is chosen or a command executed
// We can use "*" in activation events to run on startup (not always recommended)
// We can use eg. "onLanguage:7800basic" for specific activation

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Pages
	let welcomePage = new WelcomePage();
	let spriteEditorPage = new SpriteEditorPage();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(`Extension ${application.DisplayName} (${application.Version}) is now active!`);
    console.log(`- Installation path: '${application.Path}'`);
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// Welcome
	const openWelcomePage = vscode.commands.registerCommand('extension.openWelcomePage', () => {
		console.log('User activated command "extension.openWelcomePage"');
		welcomePage.openPage(context);
	});
	// SpriteEditor
	const openSpriteEditorPage = vscode.commands.registerCommand('extension.openSpriteEditorPage', () => {
		console.log('User activated command "extension.openSpriteEditorPage"');
		spriteEditorPage.openPage(context);
	});
	// 2600 editors
	const openPlayerPalPage = vscode.commands.registerCommand('extension.openPlayerPalPage', () => {
		console.log('User activated command "extension.openPlayerPalPage"');
	    application.OpenBrowserWindow('https://alienbill.com/2600/playerpalnext.html','');
	});
	const openAtariBackgroundBuilderPage = vscode.commands.registerCommand('extension.openAtariBackgroundBuilderPage', () => {
		console.log('User activated command "extension.openAtariBackgroundBuilderPage"');
		application.OpenBrowserWindow('https://alienbill.com/2600/atari-background-builder','');
	});

	// Build
	// Note: apparently the fileUri can be supplied via the command line but we are not going to use it
	const buildGame = vscode.commands.registerCommand('extension.buildGame', async (fileUri: vscode.Uri) => {
		console.log('User activated command "extension.buildGame"');
		await application.BuildGameAsync();
	});
	const buildGameAndRun = vscode.commands.registerCommand('extension.buildGameAndRun', async (fileUri: vscode.Uri) => {
		console.log('User activated command "extension.buildGameAndRun"');
		await application.BuildGameAndRunAsync();
	});
	const killBuildGame = vscode.commands.registerCommand('extension.killBuildGame', () => {
		console.log('User activated command "extension.killBuildGame"');
		application.KillBuildGame();		
	});

	// SpriteEditor
	const openSpriteEditorFile = vscode.commands.registerCommand('extension.openSpriteEditorFile', async (fileUri: vscode.Uri) => {
		console.log('User activated command "extension.openSpriteEditorFile"');		
		spriteEditorPage.openPage(context, fileUri);
	});

	// Build (touchbar)
	// Note: apparently the fileUri can be supplied via the command line but we are not going to use it
	const touchbarBuildGame = vscode.commands.registerCommand('extension.touchbar.buildGame', async (fileUri: vscode.Uri) => {
		console.log('User activated command "extension.touchbar.buildGame"');
		await application.BuildGameAsync();
	});
	const touchbarBuildGameAndRun = vscode.commands.registerCommand('extension.touchbar.buildGameAndRun', async (fileUri: vscode.Uri) => {
		console.log('User activated command "extension.touchbar.buildGameAndRun"');
		await application.BuildGameAndRunAsync();
	});

	// ContextHelp
	const openContextHelp = vscode.commands.registerCommand('extension.openContextHelp', () => {
		console.log('User activated command "extension.openContextHelp"');
		application.OpenContextHelp();
	});

	// Subscriptions (register)
	context.subscriptions.push(openWelcomePage);
	context.subscriptions.push(openSpriteEditorPage);
	context.subscriptions.push(buildGame);
	context.subscriptions.push(buildGameAndRun);
	context.subscriptions.push(killBuildGame);
	context.subscriptions.push(openSpriteEditorFile);
	// Subscriptions (touchbar)
	context.subscriptions.push(touchbarBuildGame);
	context.subscriptions.push(touchbarBuildGameAndRun);	

	// Register the mouse-over hover providers
	await application.RegisterHoverProvidersAsync(context);
    await application.RegisterContextHelpsAsync(context);

	// Register region folding providers
	await application.RegisterFoldingProvidersAsync(context);
	
	// Register intellisence features
	await application.RegisterDocumentSymbolProvidersAsync(context);
	await application.RegisterDefinitionProvidersAsync(context);
	await application.RegisterReferenceProvidersAsync(context);
	await application.RegisterCompletionProvidersAsync(context);
	
	// Show welcome messages
	await application.ShowStartupMessagesAsync();
}

// this method is called when your extension is deactivated
export function deactivate() {}

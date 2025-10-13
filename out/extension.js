"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const application = require("./application");
const wasmtime = require("./wasmtime");
const tags = require("./tags");
const configuration = require("./configuration");
const welcome_1 = require("./pages/welcome");
const spriteeditor_1 = require("./pages/spriteeditor");
require("./statusbar");
// Activation Events
// https://code.visualstudio.com/api/references/activation-events
// Activation will occur if a language is chosen or a command executed
// We can use "*" in activation events to run on startup (not always recommended)
// We can use eg. "onLanguage:7800basic" for specific activation
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Pages
        let welcomePage = new welcome_1.WelcomePage();
        let spriteEditorPage = new spriteeditor_1.SpriteEditorPage();
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        // Advise in compiler window we have started
        application.CompilerOutputChannel.show();
        application.WriteToCompilerTerminal(`Extension ${application.DisplayName} (${application.Version}) is now active!`);
        application.WriteToCompilerTerminal(`- Location: '${application.Path}'`);
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
            application.OpenBrowserWindow('https://alienbill.com/2600/playerpalnext.html');
        });
        const openAtariBackgroundBuilderPage = vscode.commands.registerCommand('extension.openAtariBackgroundBuilderPage', () => {
            console.log('User activated command "extension.openAtariBackgroundBuilderPage"');
            application.OpenBrowserWindow('https://alienbill.com/2600/atari-background-builder');
        });
        const openRTbBSpriteEditorPage = vscode.commands.registerCommand('extension.openRTbBSpriteEditorPage', () => {
            console.log('User activated command "extension.openRTbBSpriteEditorPage"');
            application.OpenBrowserWindow('https://www.randomterrain.com/2600bbsprite.html');
        });
        // Build
        // Note: apparently the fileUri can be supplied via the command line but we are not going to use it
        const buildGame = vscode.commands.registerCommand('extension.buildGame', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            console.log('User activated command "extension.buildGame"');
            yield application.BuildGameAsync();
        }));
        const buildGameAndRun = vscode.commands.registerCommand('extension.buildGameAndRun', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            console.log('User activated command "extension.buildGameAndRun"');
            yield application.BuildGameAndRunAsync();
        }));
        const killBuildGame = vscode.commands.registerCommand('extension.killBuildGame', () => {
            console.log('User activated command "extension.killBuildGame"');
            application.KillBuildGame();
        });
        // SpriteEditor
        const openSpriteEditorFile = vscode.commands.registerCommand('extension.openSpriteEditorFile', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            console.log('User activated command "extension.openSpriteEditorFile"');
            spriteEditorPage.openPage(context, fileUri);
        }));
        // Build (touchbar)
        // Note: apparently the fileUri can be supplied via the command line but we are not going to use it
        const touchbarBuildGame = vscode.commands.registerCommand('extension.touchbar.buildGame', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            console.log('User activated command "extension.touchbar.buildGame"');
            yield application.BuildGameAsync();
        }));
        const touchbarBuildGameAndRun = vscode.commands.registerCommand('extension.touchbar.buildGameAndRun', (fileUri) => __awaiter(this, void 0, void 0, function* () {
            console.log('User activated command "extension.touchbar.buildGameAndRun"');
            yield application.BuildGameAndRunAsync();
        }));
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
        // Subscriptions (document)
        context.subscriptions.push(
        // scan for ADS definitions
        vscode.workspace.onDidOpenTextDocument((document) => {
            tags.ScanDocumentForADSLanguageTag(document);
        }));
        context.subscriptions.push(
        // check if user has changed language
        vscode.workspace.onDidSaveTextDocument((document) => {
            tags.ScanDocumentForADSLanguageTag(document);
        }));
        // Validate settins on save
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => __awaiter(this, void 0, void 0, function* () {
            yield configuration.ValidateCustomFoldersConfigurationEntry(event);
        })));
        // Transfer old settings
        yield configuration.TransferFolderToCustomFolders(context);
        // Register the mouse-over hover providers
        yield application.RegisterHoverProvidersAsync(context);
        yield application.RegisterContextHelpsAsync(context);
        // Register region folding providers
        yield application.RegisterFoldingProvidersAsync(context);
        // Register intellisence features
        yield application.RegisterDocumentSymbolProvidersAsync(context);
        yield application.RegisterDefinitionProvidersAsync(context);
        yield application.RegisterReferenceProvidersAsync(context);
        yield application.RegisterCompletionProvidersAsync(context);
        // install on startup (as required)
        yield wasmtime.installAsync();
        // Show welcome messages
        yield application.ShowStartupMessagesAsync();
    });
}
// this method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map
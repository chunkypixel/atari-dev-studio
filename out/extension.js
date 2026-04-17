"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const application = __importStar(require("./application"));
const browser = __importStar(require("./browser"));
const wasmtime = __importStar(require("./wasmtime"));
const tags = __importStar(require("./tags"));
const configuration = __importStar(require("./configuration"));
const welcome_1 = require("./pages/welcome");
const spriteeditor_1 = require("./pages/spriteeditor");
const learningcenter_1 = require("./pages/learningcenter");
require("./statusbar");
// Activation Events
// https://code.visualstudio.com/api/references/activation-events
// Activation will occur if a language is chosen or a command executed
// We can use "*" in activation events to run on startup (not always recommended)
// We can use eg. "onLanguage:7800basic" for specific activation
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
async function activate(context) {
    // Pages
    let welcomePage = new welcome_1.WelcomePage();
    let spriteEditorPage = new spriteeditor_1.SpriteEditorPage();
    let learningCenterPage = new learningcenter_1.LearningCenterPage();
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
    // LearningCenter
    const openLearningCenterPage = vscode.commands.registerCommand('extension.openLearningCenterPage', () => {
        console.log('User activated command "extension.openLearningCenterPage"');
        learningCenterPage.openPage(context);
    });
    // 2600 editors
    const openPlayerPalPage = vscode.commands.registerCommand('extension.openPlayerPalPage', () => {
        console.log('User activated command "extension.openPlayerPalPage"');
        browser.OpenUrlInBrowser('https://alienbill.com/2600/playerpalnext.html');
    });
    const openAtariBackgroundBuilderPage = vscode.commands.registerCommand('extension.openAtariBackgroundBuilderPage', () => {
        console.log('User activated command "extension.openAtariBackgroundBuilderPage"');
        browser.OpenUrlInBrowser('https://alienbill.com/2600/atari-background-builder');
    });
    const openRTbBSpriteEditorPage = vscode.commands.registerCommand('extension.openRTbBSpriteEditorPage', () => {
        console.log('User activated command "extension.openRTbBSpriteEditorPage"');
        browser.OpenUrlInBrowser('https://www.randomterrain.com/2600bbsprite.html');
    });
    // Build
    // Note: apparently the fileUri can be supplied via the command line but we are not going to use it
    const buildGame = vscode.commands.registerCommand('extension.buildGame', async (fileUri) => {
        console.log('User activated command "extension.buildGame"');
        await application.BuildGameAsync();
    });
    const buildGameAndRun = vscode.commands.registerCommand('extension.buildGameAndRun', async (fileUri) => {
        console.log('User activated command "extension.buildGameAndRun"');
        await application.BuildGameAndRunAsync();
    });
    const killBuildGame = vscode.commands.registerCommand('extension.killBuildGame', () => {
        console.log('User activated command "extension.killBuildGame"');
        application.KillBuildGame();
    });
    // SpriteEditor
    const openSpriteEditorFile = vscode.commands.registerCommand('extension.openSpriteEditorFile', async (fileUri) => {
        console.log('User activated command "extension.openSpriteEditorFile"');
        spriteEditorPage.openPage(context, fileUri);
    });
    // Launcher
    const launchBinaryFileTo7800GD = vscode.commands.registerCommand('extension.launchBinaryFileTo7800GD', async (fileUri) => {
        console.log('User activated command "extension.launchBinaryFileTo7800GD"');
        await application.LaunchBinaryFileTo7800GDAsync(fileUri);
    });
    // Build (touchbar)
    // Note: apparently the fileUri can be supplied via the command line but we are not going to use it
    const touchbarBuildGame = vscode.commands.registerCommand('extension.touchbar.buildGame', async (fileUri) => {
        console.log('User activated command "extension.touchbar.buildGame"');
        await application.BuildGameAsync();
    });
    const touchbarBuildGameAndRun = vscode.commands.registerCommand('extension.touchbar.buildGameAndRun', async (fileUri) => {
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
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
        await configuration.ValidateCustomFoldersConfigurationEntry(event);
    }));
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
    // Check active documents
    // Transfer old settings
    await configuration.TransferFolderToCustomFolders(context);
    // Opening a samples folder? (on restart)
    await configuration.ValidateOpenSamplesFileOnRestart(context);
    // Validate any open documents (for setting language)
    await application.ValidateOpenDocumentsOnStartup(context);
    // Housekeeping
    // install on startup (as required)
    await wasmtime.ValidateAndInstallWasmtime();
    // Show welcome messages
    await application.ShowStartupMessages(context);
}
// this method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map
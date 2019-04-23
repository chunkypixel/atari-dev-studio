"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const application = require("./application");
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
    // Pages
    let welcomePage = new welcome_1.WelcomePage();
    let spriteEditorPage = new spriteeditor_1.SpriteEditorPage();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(`Extension ${application.DisplayName} (${application.Version}) is now active!`);
    console.log(`- Installation path: '${application.Path}'`);
    // Github: https://github.com/chunkypixel/atari-dev-studio/issues/2
    //         Annoyance remove
    // Announcement
    //vscode.window.showInformationMessage(`Welcome to ${application.DisplayName} (v${application.Version})!`);
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
    // Build
    // Note: apparently the fileUri can be supplied via the command line but we are not going to use it
    const buildGame = vscode.commands.registerCommand('extension.buildGame', (fileUri) => __awaiter(this, void 0, void 0, function* () {
        console.log('User activated command "extension.buildGame"');
        yield application.BuildGameAsync(fileUri);
    }));
    const buildGameAndRun = vscode.commands.registerCommand('extension.buildGameAndRun', (fileUri) => __awaiter(this, void 0, void 0, function* () {
        console.log('User activated command "extension.buildGameAndRun"');
        yield application.BuildGameAndRunAsync(fileUri);
    }));
    // Subscriptions (register)
    context.subscriptions.push(openWelcomePage);
    context.subscriptions.push(openSpriteEditorPage);
    context.subscriptions.push(buildGame);
    context.subscriptions.push(buildGameAndRun);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
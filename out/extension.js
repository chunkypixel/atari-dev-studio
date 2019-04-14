"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const Application = require("./application");
const welcome_1 = require("./pages/welcome");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Initialise
    let welcomePage = new welcome_1.WelcomePage();
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(`Extension ${Application.DisplayName()} (${Application.Version()}) is now active!`);
    console.log(`- Installation path: '${Application.Path()}'`);
    // Announcement
    vscode.window.showInformationMessage(`Welcome to ${Application.DisplayName()}!`);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let openWelcomePage = vscode.commands.registerCommand('extension.openWelcomePage', () => {
        console.log('User activated command "extension.openWelcomePage"');
        welcomePage.openWelcomePage(context);
    });
    // Subscriptions
    context.subscriptions.push(openWelcomePage);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
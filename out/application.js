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
const vscode = require("vscode");
const filesystem = require("./filesystem");
const os = require("os");
const batariBasicCompiler_1 = require("./compilers/batariBasicCompiler");
const seventyEightHundredBasicCompiler_1 = require("./compilers/seventyEightHundredBasicCompiler");
const dasmCompiler_1 = require("./compilers/dasmCompiler");
const stellaEmulator_1 = require("./emulators/stellaEmulator");
const a7800Emulator_1 = require("./emulators/a7800Emulator");
// -------------------------------------------------------------------------------------
// Operating System
// -------------------------------------------------------------------------------------
exports.OSPlatform = os.platform();
exports.OSArch = os.arch();
exports.IsWindows = (os.platform() === 'win32');
exports.IsLinux = (os.platform() === 'linux');
exports.IsMacOS = (os.platform() === 'darwin');
exports.Is32Bit = (os.arch() === 'x32');
exports.Is64Bit = (os.arch() === 'x64');
// -------------------------------------------------------------------------------------
// Extension
// -------------------------------------------------------------------------------------
exports.Id = "chunkypixel.atari-dev-studio";
exports.Path = vscode.extensions.getExtension(exports.Id).extensionPath;
exports.Name = vscode.extensions.getExtension(exports.Id).packageJSON.name;
exports.Publisher = vscode.extensions.getExtension(exports.Id).packageJSON.publisher;
exports.Version = vscode.extensions.getExtension(exports.Id).packageJSON.version;
exports.DisplayName = vscode.extensions.getExtension(exports.Id).packageJSON.displayName;
exports.Description = vscode.extensions.getExtension(exports.Id).packageJSON.description;
exports.PreferencesSettingsExtensionPath = `${(exports.IsMacOS ? "Code" : "File")} -> Preferences -> Settings -> Extensions -> ${exports.DisplayName}`;
// -------------------------------------------------------------------------------------
// Channels
// -------------------------------------------------------------------------------------
exports.CompilerOutputChannel = vscode.window.createOutputChannel("Compiler");
// -------------------------------------------------------------------------------------
// Compilers
// Register compilers here and in order of preference
// -------------------------------------------------------------------------------------
exports.Compilers = [
    new batariBasicCompiler_1.BatariBasicCompiler(),
    new seventyEightHundredBasicCompiler_1.SeventyEightHundredBasicCompiler(),
    new dasmCompiler_1.DasmCompiler()
];
// -------------------------------------------------------------------------------------
// Emulators
// Register emulators here and in order of preference
// -------------------------------------------------------------------------------------
exports.Emulators = [
    new stellaEmulator_1.StellaEmulator(),
    new a7800Emulator_1.A7800Emulator()
];
// -------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------
function BuildGameAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get document
        let document = yield filesystem.GetDocumentAsync(fileUri);
        if (!document || document.uri.scheme != "file")
            return false;
        // Find compiler
        let compiler = getChosenCompiler(document);
        if (compiler)
            return yield compiler.BuildGameAsync(document);
        // Result
        return false;
    });
}
exports.BuildGameAsync = BuildGameAsync;
function BuildGameAndRunAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get document
        let document = yield filesystem.GetDocumentAsync(fileUri);
        if (!document || document.uri.scheme != "file")
            return false;
        // Find compiler
        let compiler = getChosenCompiler(document);
        if (compiler)
            return yield compiler.BuildGameAndRunAsync(document);
        // Result
        return false;
    });
}
exports.BuildGameAndRunAsync = BuildGameAndRunAsync;
function Notify(message) {
    exports.CompilerOutputChannel.appendLine(message);
    console.log(`debugger:${message}`);
}
exports.Notify = Notify;
function getChosenCompiler(document) {
    // Prepare
    let configuration = vscode.workspace.getConfiguration(exports.Name, null);
    // Find compiler (based on configuration selection)
    let chosenCompiler = configuration.get(`compilation.defaultCompiler`);
    if (chosenCompiler) {
        for (let compiler of exports.Compilers) {
            if (compiler.Id === chosenCompiler || compiler.Name === chosenCompiler) {
                return compiler;
            }
        }
    }
    // Find compiler (based on language of chosen file)
    for (let compiler of exports.Compilers) {
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
    if (configuration.get(`editor.preserveCodeEditorFocus`)) {
        exports.CompilerOutputChannel.show();
    }
    // Clear output content?
    if (configuration.get(`editor.clearPreviousOutput`)) {
        exports.CompilerOutputChannel.clear();
    }
    // Not found
    Notify(`Unable to determine a compiler to use based on your chosen default compiler '${chosenCompiler}'. Review your selection in ${exports.PreferencesSettingsExtensionPath}.`);
    // Not found
    return undefined;
}
//# sourceMappingURL=application.js.map
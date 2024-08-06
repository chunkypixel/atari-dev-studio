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
exports.IsNumber = exports.Delay = exports.ShowStartupMessagesAsync = exports.GetConfiguration = exports.ShowErrorPopup = exports.ShowInformationPopup = exports.ShowWarningPopup = exports.WriteToCompilerTerminal = exports.OpenContextHelp = exports.OpenBrowserWindow = exports.KillBuildGame = exports.BuildGameAndRunAsync = exports.BuildGameAsync = exports.RegisterContextHelpsAsync = exports.ContextHelps = exports.RegisterReferenceProvidersAsync = exports.ReferenceProviders = exports.RegisterDefinitionProvidersAsync = exports.DefinitionProviders = exports.RegisterDocumentSymbolProvidersAsync = exports.DocumentSymbolProviders = exports.RegisterFoldingProvidersAsync = exports.Foldings = exports.RegisterCompletionProvidersAsync = exports.Completions = exports.RegisterHoverProvidersAsync = exports.Hovers = exports.Serials = exports.Emulators = exports.Compilers = exports.InitialiseAdsTerminalAsync = exports.AdsTerminal = exports.CompilerOutputChannel = exports.ChangeLogUri = exports.PreferencesSettingsExtensionPath = exports.Description = exports.DisplayName = exports.Version = exports.Publisher = exports.Name = exports.Path = exports.Id = exports.IsMacOSArm = exports.Is64Bit = exports.Is32Bit = exports.IsMacOS = exports.IsLinux = exports.IsWindows = exports.OSArch = exports.OSPlatform = void 0;
const vscode = require("vscode");
const filesystem = require("./filesystem");
const opn = require('opn');
const os = require("os");
const batariBasicCompiler_1 = require("./compilers/batariBasicCompiler");
const seventyEightHundredBasicCompiler_1 = require("./compilers/seventyEightHundredBasicCompiler");
const dasmCompiler_1 = require("./compilers/dasmCompiler");
const makeCompiler_1 = require("./compilers/makeCompiler");
const batchCompiler_1 = require("./compilers/batchCompiler");
const shellScriptCompiler_1 = require("./compilers/shellScriptCompiler");
const stellaEmulator_1 = require("./emulators/stellaEmulator");
const a7800Emulator_1 = require("./emulators/a7800Emulator");
const dasmHover_1 = require("./hovers/dasmHover");
const batariBasicHover_1 = require("./hovers/batariBasicHover");
const seventyEightHundredBasicHover_1 = require("./hovers/seventyEightHundredBasicHover");
const seventyEightHundredBasicCompletion_1 = require("./completions/seventyEightHundredBasicCompletion");
const batariBasicFolding_1 = require("./foldings/batariBasicFolding");
const seventyEightHundredBasicFolding_1 = require("./foldings/seventyEightHundredBasicFolding");
const seventyEightHundredBasicDocumentSymbolProvider_1 = require("./documentSymbolProvider/seventyEightHundredBasicDocumentSymbolProvider");
const batariBasicDocumentSymbolProvider_1 = require("./documentSymbolProvider/batariBasicDocumentSymbolProvider");
const dasmDocumentSymbolProvider_1 = require("./documentSymbolProvider/dasmDocumentSymbolProvider");
const seventyEightHundredBasicDefinitionProvider_1 = require("./definitionProvider/seventyEightHundredBasicDefinitionProvider");
const batariBasicDefinitionProvider_1 = require("./definitionProvider/batariBasicDefinitionProvider");
const dasmDefinitionProvider_1 = require("./definitionProvider/dasmDefinitionProvider");
const seventyEightHundredBasicReferenceProvider_1 = require("./referenceProvider/seventyEightHundredBasicReferenceProvider");
const batariBasicReferenceProvider_1 = require("./referenceProvider/batariBasicReferenceProvider");
const dasmReferenceProvider_1 = require("./referenceProvider/dasmReferenceProvider");
const seventyEightHundredBasicContextHelp_1 = require("./contexthelp/seventyEightHundredBasicContextHelp");
const batariBasicContextHelp_1 = require("./contexthelp/batariBasicContextHelp");
const SeventyEightHundredGDSerial_1 = require("./serial/SeventyEightHundredGDSerial");
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
exports.IsMacOSArm = (os.platform() === 'darwin' && os.arch() === 'arm64');
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
exports.ChangeLogUri = vscode.Uri.parse(`https://marketplace.visualstudio.com/items/${exports.Id}/changelog`);
// -------------------------------------------------------------------------------------
// Channels
// -------------------------------------------------------------------------------------
exports.CompilerOutputChannel = vscode.window.createOutputChannel("Compiler");
function InitialiseAdsTerminalAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        // Already have a terminal?
        if (exports.AdsTerminal !== undefined && (yield exports.AdsTerminal.processId)) {
            exports.AdsTerminal === null || exports.AdsTerminal === void 0 ? void 0 : exports.AdsTerminal.show(true);
            return;
        }
        // Create
        exports.AdsTerminal = vscode.window.createTerminal(`${exports.Name}`);
        // User closed a terminal? if so verify it's ours and clear the reference
        vscode.window.onDidCloseTerminal((terminal) => {
            if (terminal.name === exports.Name) {
                exports.AdsTerminal = undefined;
            }
        });
    });
}
exports.InitialiseAdsTerminalAsync = InitialiseAdsTerminalAsync;
// -------------------------------------------------------------------------------------
// Compilers
// Register compilers here and in order of preference
// -------------------------------------------------------------------------------------
exports.Compilers = [
    new batariBasicCompiler_1.BatariBasicCompiler(),
    new seventyEightHundredBasicCompiler_1.SeventyEightHundredBasicCompiler(),
    new dasmCompiler_1.DasmCompiler(),
    new makeCompiler_1.MakeCompiler(),
    new batchCompiler_1.BatchCompiler(),
    new shellScriptCompiler_1.ShellScriptCompiler()
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
// Serial
// Language intellisense
// -------------------------------------------------------------------------------------
exports.Serials = [
    new SeventyEightHundredGDSerial_1.SeventyEightHundredGDSerial()
];
// -------------------------------------------------------------------------------------
// Hovers
// Language tooltips
// -------------------------------------------------------------------------------------
exports.Hovers = [
    new dasmHover_1.DasmHover(),
    new batariBasicHover_1.BatariBasicHover(),
    new seventyEightHundredBasicHover_1.SeventyEightHundredBasicHover()
];
function RegisterHoverProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let hover of exports.Hovers) {
            yield hover.RegisterAsync(context);
        }
    });
}
exports.RegisterHoverProvidersAsync = RegisterHoverProvidersAsync;
// -------------------------------------------------------------------------------------
// Completion
// Language intellisense
// -------------------------------------------------------------------------------------
exports.Completions = [
    new seventyEightHundredBasicCompletion_1.SeventyEightHundredBasicCompletion()
];
function RegisterCompletionProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let completion of exports.Completions) {
            yield completion.RegisterAsync(context);
        }
    });
}
exports.RegisterCompletionProvidersAsync = RegisterCompletionProvidersAsync;
// -------------------------------------------------------------------------------------
// Region Folding
// Language intellisense
// -------------------------------------------------------------------------------------
exports.Foldings = [
    new batariBasicFolding_1.BatariBasicFolding(),
    new seventyEightHundredBasicFolding_1.SeventyEightHundredBasicFolding()
];
function RegisterFoldingProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let folding of exports.Foldings) {
            yield folding.RegisterAsync(context);
        }
    });
}
exports.RegisterFoldingProvidersAsync = RegisterFoldingProvidersAsync;
// -------------------------------------------------------------------------------------
// DocumentSymbolProviders
// Language intellisense
// -------------------------------------------------------------------------------------
exports.DocumentSymbolProviders = [
    new batariBasicDocumentSymbolProvider_1.BatariBasicDocumentSymbolProvider(),
    new seventyEightHundredBasicDocumentSymbolProvider_1.SeventyEightHundredBasicDocumentSymbolProvider(),
    new dasmDocumentSymbolProvider_1.DasmDocumentSymbolProvider()
];
function RegisterDocumentSymbolProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let documentSymbolProvider of exports.DocumentSymbolProviders) {
            yield documentSymbolProvider.RegisterAsync(context);
        }
    });
}
exports.RegisterDocumentSymbolProvidersAsync = RegisterDocumentSymbolProvidersAsync;
// -------------------------------------------------------------------------------------
// DefinitionProviders
// Language intellisense
// -------------------------------------------------------------------------------------
exports.DefinitionProviders = [
    new batariBasicDefinitionProvider_1.BatariBasicDefinitionProvider(),
    new seventyEightHundredBasicDefinitionProvider_1.SeventyEightHundredBasicDefinitionProvider(),
    new dasmDefinitionProvider_1.DasmDefinitionProvider()
];
function RegisterDefinitionProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let definitionProvider of exports.DefinitionProviders) {
            yield definitionProvider.RegisterAsync(context);
        }
    });
}
exports.RegisterDefinitionProvidersAsync = RegisterDefinitionProvidersAsync;
// -------------------------------------------------------------------------------------
// ReferenceProviders
// Language intellisense
// -------------------------------------------------------------------------------------
exports.ReferenceProviders = [
    new batariBasicReferenceProvider_1.BatariBasicReferenceProvider(),
    new seventyEightHundredBasicReferenceProvider_1.SeventyEightHundredBasicReferenceProvider(),
    new dasmReferenceProvider_1.DasmReferenceProvider()
];
function RegisterReferenceProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let referenceProvider of exports.ReferenceProviders) {
            yield referenceProvider.RegisterAsync(context);
        }
    });
}
exports.RegisterReferenceProvidersAsync = RegisterReferenceProvidersAsync;
// -------------------------------------------------------------------------------------
// ContextHelp
// Language intellisense
// -------------------------------------------------------------------------------------
exports.ContextHelps = [
    new batariBasicContextHelp_1.BatariBasicContextHelp(),
    new seventyEightHundredBasicContextHelp_1.SeventyEightHundredBasicContextHelp()
];
function RegisterContextHelpsAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let contextHelp of exports.ContextHelps) {
            yield contextHelp.RegisterAsync(context);
        }
    });
}
exports.RegisterContextHelpsAsync = RegisterContextHelpsAsync;
// -------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------
function BuildGameAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get document
        let document = yield filesystem.GetDocumentAsync(fileUri);
        if (!document || document.uri.scheme !== "file") {
            return false;
        }
        // Find compiler
        let compiler = getChosenCompiler(document);
        if (compiler) {
            return yield compiler.BuildGameAsync(document);
        }
        // Result
        return false;
    });
}
exports.BuildGameAsync = BuildGameAsync;
function BuildGameAndRunAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get document
        let document = yield filesystem.GetDocumentAsync(fileUri);
        if (!document || document.uri.scheme !== "file") {
            return false;
        }
        // Find compiler
        let compiler = getChosenCompiler(document);
        if (compiler) {
            return yield compiler.BuildGameAndRunAsync(document);
        }
        // Result
        return false;
    });
}
exports.BuildGameAndRunAsync = BuildGameAndRunAsync;
function KillBuildGame() {
    // Process all compilers
    for (let compiler of exports.Compilers) {
        if (compiler.IsRunning) {
            compiler.Kill();
        }
    }
}
exports.KillBuildGame = KillBuildGame;
function OpenBrowserWindow(path, browser) {
    opn(path, { app: browser })
        .catch((_) => {
        vscode.window.showErrorMessage(`Open browser failed!! Please check if you have installed the browser ${browser} correctly!`);
    });
}
exports.OpenBrowserWindow = OpenBrowserWindow;
function OpenContextHelp() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get active editor
        var activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        // Find context help (based on language of chosen file)
        for (let contextHelp of exports.ContextHelps) {
            if (contextHelp.Id === (activeEditor === null || activeEditor === void 0 ? void 0 : activeEditor.document.languageId)) {
                // Get position of cursor
                var position = activeEditor.selection.start;
                yield contextHelp.OpenContextHelpAtCursorAsync(activeEditor.document, position);
            }
        }
    });
}
exports.OpenContextHelp = OpenContextHelp;
function WriteToCompilerTerminal(message, writeToLog = false) {
    exports.CompilerOutputChannel.appendLine(message);
    if (writeToLog) {
        console.log(`debugger:${message}`);
    }
}
exports.WriteToCompilerTerminal = WriteToCompilerTerminal;
function ShowWarningPopup(message) {
    vscode.window.showWarningMessage(message);
}
exports.ShowWarningPopup = ShowWarningPopup;
function ShowInformationPopup(message) {
    vscode.window.showInformationMessage(message);
}
exports.ShowInformationPopup = ShowInformationPopup;
function ShowErrorPopup(message) {
    vscode.window.showErrorMessage(message);
}
exports.ShowErrorPopup = ShowErrorPopup;
function GetConfiguration() {
    return vscode.workspace.getConfiguration(exports.Name, null);
}
exports.GetConfiguration = GetConfiguration;
function getChosenCompiler(document) {
    // Prepare
    let configuration = GetConfiguration();
    // Find compiler (based on language of chosen file)
    for (let compiler of exports.Compilers) {
        if (compiler.Id === document.languageId) {
            return compiler;
        }
    }
    // Activate output window?
    if (configuration.get(`editor.preserveCodeEditorFocus`)) {
        exports.CompilerOutputChannel.show();
    }
    // Clear output content?
    if (configuration.get(`editor.clearPreviousOutput`)) {
        exports.CompilerOutputChannel.clear();
    }
    // Not found
    return undefined;
}
function ShowStartupMessagesAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        let configuration = GetConfiguration();
        // Load settings
        let showNewVersionMessage = configuration.get(`application.configuration.showNewVersionMessage`);
        let latestVersion = configuration.get(`application.configuration.latestVersion`);
        // Process?
        if (!showNewVersionMessage || latestVersion === exports.Version) {
            return;
        }
        // Update latest version
        configuration.update(`application.configuration.latestVersion`, exports.Version, vscode.ConfigurationTarget.Global);
        // buttons
        let latestChanges = "Learn more about the latest changes";
        let dontShowMeThisMessage = "Don't show me this message again";
        // Show prompt
        yield vscode.window.showInformationMessage(`Welcome to the new version of ${exports.DisplayName}`, latestChanges, dontShowMeThisMessage)
            .then(selection => {
            if (selection === undefined) {
                // Dismissed
            }
            else if (selection === latestChanges) {
                // Show changelog
                vscode.env.openExternal(exports.ChangeLogUri);
            }
            else if (selection = dontShowMeThisMessage) {
                // Disable
                configuration.update(`application.configuration.showNewVersionMessage`, false, vscode.ConfigurationTarget.Global);
            }
        });
    });
}
exports.ShowStartupMessagesAsync = ShowStartupMessagesAsync;
function Delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.Delay = Delay;
function IsNumber(numStr) {
    return !isNaN(parseFloat(numStr)) && !isNaN(+numStr);
}
exports.IsNumber = IsNumber;
//# sourceMappingURL=application.js.map
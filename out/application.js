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
exports.ContextHelps = exports.ReferenceProviders = exports.DefinitionProviders = exports.DocumentSymbolProviders = exports.Foldings = exports.Completions = exports.Hovers = exports.Serials = exports.Emulators = exports.Compilers = exports.AdsTerminal = exports.CompilerOutputChannel = exports.BatariBasicLanguageId = exports.SeventyEightHundredBasicLanguageId = exports.BATARIBASIC_WASMTIME_RELEASE = exports.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE = exports.EnvironmentSummary = exports.ChangeLogUri = exports.PreferencesSettingsExtensionPath = exports.Description = exports.DisplayName = exports.Version = exports.Publisher = exports.Name = exports.Path = exports.Id = exports.IsMacOSArm = exports.Is64Bit = exports.Is32Bit = exports.IsMacOS = exports.IsLinux = exports.IsWindows = exports.OSRelease = exports.OSArch = exports.OSPlatform = void 0;
exports.InitialiseAdsTerminalAsync = InitialiseAdsTerminalAsync;
exports.RegisterHoverProvidersAsync = RegisterHoverProvidersAsync;
exports.RegisterCompletionProvidersAsync = RegisterCompletionProvidersAsync;
exports.RegisterFoldingProvidersAsync = RegisterFoldingProvidersAsync;
exports.RegisterDocumentSymbolProvidersAsync = RegisterDocumentSymbolProvidersAsync;
exports.RegisterDefinitionProvidersAsync = RegisterDefinitionProvidersAsync;
exports.RegisterReferenceProvidersAsync = RegisterReferenceProvidersAsync;
exports.RegisterContextHelpsAsync = RegisterContextHelpsAsync;
exports.BuildGameAsync = BuildGameAsync;
exports.BuildGameAndRunAsync = BuildGameAndRunAsync;
exports.KillBuildGame = KillBuildGame;
exports.OpenContextHelp = OpenContextHelp;
exports.WriteToCompilerTerminal = WriteToCompilerTerminal;
exports.WriteEnvironmentSummaryToCompilerTerminal = WriteEnvironmentSummaryToCompilerTerminal;
exports.ShowWarningPopup = ShowWarningPopup;
exports.ShowInformationPopup = ShowInformationPopup;
exports.ShowErrorPopup = ShowErrorPopup;
exports.ValidateOpenDocumentsOnStartup = ValidateOpenDocumentsOnStartup;
exports.ShowStartupMessages = ShowStartupMessages;
exports.GetActiveTextEditorDocumentAsync = GetActiveTextEditorDocumentAsync;
exports.Delay = Delay;
exports.IsNumber = IsNumber;
exports.CountTrailingZeros = CountTrailingZeros;
exports.TrimRight = TrimRight;
exports.TrimLeft = TrimLeft;
exports.ReplaceZerosTemplate = ReplaceZerosTemplate;
const vscode = require("vscode");
const configuration = require("./configuration");
const tags = require("./tags");
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
const batariBasicCompletion_1 = require("./completions/batariBasicCompletion");
const os = require("os");
// -------------------------------------------------------------------------------------
// Operating System
// -------------------------------------------------------------------------------------
exports.OSPlatform = os.platform();
exports.OSArch = os.arch();
exports.OSRelease = os.release();
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
// ENVIRONMENT
// -------------------------------------------------------------------------------------
exports.EnvironmentSummary = `Operating System: ${(exports.IsWindows ? "Windows" : exports.IsLinux ? "Linux" : exports.IsMacOS ? "MacOS" : "Unknown")} (${exports.OSArch}), VSCode: v${vscode.version}, ${exports.DisplayName}: v${exports.Version}`;
exports.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE = 0.37;
exports.BATARIBASIC_WASMTIME_RELEASE = 1.9;
// -------------------------------------------------------------------------------------
// Languages
// -------------------------------------------------------------------------------------
exports.SeventyEightHundredBasicLanguageId = "7800basic";
exports.BatariBasicLanguageId = "batariBasic";
// -------------------------------------------------------------------------------------
// Channels
// -------------------------------------------------------------------------------------
exports.CompilerOutputChannel = vscode.window.createOutputChannel("Atari Compiler");
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
// -------------------------------------------------------------------------------------
// Completion
// Language intellisense
// -------------------------------------------------------------------------------------
exports.Completions = [
    new seventyEightHundredBasicCompletion_1.SeventyEightHundredBasicCompletion(),
    new batariBasicCompletion_1.BatariBasicCompletion()
];
function RegisterCompletionProvidersAsync(context) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let completion of exports.Completions) {
            yield completion.RegisterAsync(context);
        }
    });
}
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
// -------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------
function BuildGameAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get document
        let document = yield GetActiveTextEditorDocumentAsync();
        if (!document || document.uri.scheme !== "file") {
            return false;
        }
        // Find compiler
        let compiler = configuration.GetChosenCompiler(document);
        if (compiler) {
            return yield compiler.BuildGameAsync(document);
        }
        // Result
        return false;
    });
}
function BuildGameAndRunAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get document
        let document = yield GetActiveTextEditorDocumentAsync();
        if (!document || document.uri.scheme !== "file") {
            return false;
        }
        // Find compiler
        let compiler = configuration.GetChosenCompiler(document);
        if (compiler) {
            return yield compiler.BuildGameAndRunAsync(document);
        }
        // Result
        return false;
    });
}
function KillBuildGame() {
    // Process all compilers
    for (let compiler of exports.Compilers) {
        if (compiler.IsRunning) {
            compiler.Kill();
        }
    }
}
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
function WriteToCompilerTerminal(message = '', lineFeed = true, writeToLog = false) {
    // Output
    if (lineFeed) {
        exports.CompilerOutputChannel.appendLine(message);
    }
    else {
        exports.CompilerOutputChannel.append(message);
    }
    // Write to log?
    if (writeToLog) {
        console.log(`debugger:${message}`);
    }
}
function WriteEnvironmentSummaryToCompilerTerminal() {
    // Write
    WriteToCompilerTerminal(exports.EnvironmentSummary);
    WriteToCompilerTerminal();
}
function ShowWarningPopup(message) {
    vscode.window.showWarningMessage(message);
}
function ShowInformationPopup(message) {
    vscode.window.showInformationMessage(message);
}
function ShowErrorPopup(message) {
    vscode.window.showErrorMessage(message);
}
function ValidateOpenDocumentsOnStartup(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate all open documents
        const openDocuments = vscode.workspace.textDocuments;
        if (openDocuments.length > 0) {
            // Scan/process each existing open document
            openDocuments.forEach((document) => {
                tags.ScanDocumentForADSLanguageTag(document);
            });
        }
    });
}
function ShowStartupMessages(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Prepare
        const config = configuration.GetAtariDevStudioConfiguration();
        // Load settings
        const showNewVersionMessage = config.get(`application.configuration.showNewVersionMessage`);
        let latestVersion = yield context.globalState.get(`${exports.Name}.configuration.latestVersion`, undefined);
        // Process?
        if (!showNewVersionMessage || latestVersion === exports.Version)
            return;
        // Set latest version
        yield context.globalState.update(`${exports.Name}.configuration.latestVersion`, exports.Version);
        // buttons
        const latestChanges = "Learn more about the latest changes";
        const dontShowMeThisMessage = "Don't show me this message again";
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
            else if (selection === dontShowMeThisMessage) {
                // Disable
                config.update(`application.configuration.showNewVersionMessage`, false, vscode.ConfigurationTarget.Global);
            }
        });
    });
}
function GetActiveTextEditorDocumentAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure coding area active before reading current document
        yield vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
        // Try current document
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            return editor.document;
        }
        return null;
    });
}
function Delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function IsNumber(numStr) {
    return !isNaN(parseFloat(numStr)) && !isNaN(+numStr);
}
function CountTrailingZeros(str) {
    if (!str)
        return 0; // Handle empty string
    const match = str.match(/0+$/);
    return match ? match[0].length : 0;
}
function TrimRight(str, length) {
    if (length <= 0)
        return ''; // Handle invalid length
    return str.slice(-length); // Extract from end using negative index
}
function TrimLeft(str, length) {
    if (length <= 0)
        return ''; // Handle invalid length
    return str.slice(0, length); // Extract from start to length
}
function ReplaceZerosTemplate(template, num) {
    const numStr = num.toString();
    if (numStr.length > template.length) {
        return numStr; // If number is longer than template, return number as is
    }
    return template.slice(0, template.length - numStr.length) + numStr;
}
//# sourceMappingURL=application.js.map
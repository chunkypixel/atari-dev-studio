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
exports.ContextHelps = exports.ReferenceProviders = exports.DefinitionProviders = exports.DocumentSymbolProviders = exports.Foldings = exports.Completions = exports.Hovers = exports.Serials = exports.Emulators = exports.Compilers = exports.AdsTerminal = exports.CompilerOutputChannel = exports.BatariBasicLanguageId = exports.SeventyEightHundredBasicLanguageId = exports.AtariDevStudioTerminalWindowName = exports.AtariDevStudioCompilerWindowName = exports.BATARIBASIC_WASMTIME_RELEASE = exports.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE = exports.EnvironmentSummary = exports.ChangeLogUri = exports.PreferencesSettingsExtensionPath = exports.Description = exports.DisplayName = exports.Version = exports.Publisher = exports.Name = exports.Path = exports.Id = exports.IsMacOSArm = exports.Is64Bit = exports.Is32Bit = exports.IsMacOS = exports.IsLinux = exports.IsWindows = exports.OSRelease = exports.OSArch = exports.OSPlatform = void 0;
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
exports.LaunchBinaryFileTo7800GDAsync = LaunchBinaryFileTo7800GDAsync;
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
const vscode = __importStar(require("vscode"));
const configuration = __importStar(require("./configuration"));
const tags = __importStar(require("./tags"));
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
// Environment
// -------------------------------------------------------------------------------------
exports.EnvironmentSummary = `Operating System: ${(exports.IsWindows ? "Windows" : exports.IsLinux ? "Linux" : exports.IsMacOS ? "MacOS" : "Unknown")} (${exports.OSArch}), VSCode: v${vscode.version}, ${exports.DisplayName}: v${exports.Version}`;
exports.SEVENTYEIGHTHUNDREDBASIC_WASMTIME_RELEASE = 0.37;
exports.BATARIBASIC_WASMTIME_RELEASE = 1.9;
exports.AtariDevStudioCompilerWindowName = "ADS Compiler";
exports.AtariDevStudioTerminalWindowName = "ADS Terminal";
// -------------------------------------------------------------------------------------
// Languages
// -------------------------------------------------------------------------------------
exports.SeventyEightHundredBasicLanguageId = "7800basic";
exports.BatariBasicLanguageId = "batariBasic";
// -------------------------------------------------------------------------------------
// Channels
// -------------------------------------------------------------------------------------
exports.CompilerOutputChannel = vscode.window.createOutputChannel(exports.AtariDevStudioCompilerWindowName);
async function InitialiseAdsTerminalAsync() {
    // Already have a terminal?
    if (exports.AdsTerminal !== undefined && await exports.AdsTerminal.processId) {
        exports.AdsTerminal?.show(true);
        return;
    }
    // Create
    if (exports.IsWindows) {
        // For windows we need to create a CMD window
        // NOTE: by default VSCode uses powershell
        exports.AdsTerminal = vscode.window.createTerminal({
            name: exports.AtariDevStudioTerminalWindowName,
            shellPath: "C:\\Windows\\System32\\cmd.exe"
        });
    }
    else {
        // Let system choose
        exports.AdsTerminal = vscode.window.createTerminal(exports.AtariDevStudioTerminalWindowName);
    }
    // User closed a terminal? if so verify it's ours and clear the reference
    vscode.window.onDidCloseTerminal((terminal) => {
        if (terminal.name === exports.Name) {
            exports.AdsTerminal = undefined;
        }
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
async function RegisterHoverProvidersAsync(context) {
    for (const hover of exports.Hovers) {
        await hover.RegisterAsync(context);
    }
}
// -------------------------------------------------------------------------------------
// Completion
// Language intellisense
// -------------------------------------------------------------------------------------
exports.Completions = [
    new seventyEightHundredBasicCompletion_1.SeventyEightHundredBasicCompletion(),
    new batariBasicCompletion_1.BatariBasicCompletion()
];
async function RegisterCompletionProvidersAsync(context) {
    for (const completion of exports.Completions) {
        await completion.RegisterAsync(context);
    }
}
// -------------------------------------------------------------------------------------
// Region Folding
// Language intellisense
// -------------------------------------------------------------------------------------
exports.Foldings = [
    new batariBasicFolding_1.BatariBasicFolding(),
    new seventyEightHundredBasicFolding_1.SeventyEightHundredBasicFolding()
];
async function RegisterFoldingProvidersAsync(context) {
    for (const folding of exports.Foldings) {
        await folding.RegisterAsync(context);
    }
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
async function RegisterDocumentSymbolProvidersAsync(context) {
    for (const documentSymbolProvider of exports.DocumentSymbolProviders) {
        await documentSymbolProvider.RegisterAsync(context);
    }
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
async function RegisterDefinitionProvidersAsync(context) {
    for (const definitionProvider of exports.DefinitionProviders) {
        await definitionProvider.RegisterAsync(context);
    }
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
async function RegisterReferenceProvidersAsync(context) {
    for (const referenceProvider of exports.ReferenceProviders) {
        await referenceProvider.RegisterAsync(context);
    }
}
// -------------------------------------------------------------------------------------
// ContextHelp
// Language intellisense
// -------------------------------------------------------------------------------------
exports.ContextHelps = [
    new batariBasicContextHelp_1.BatariBasicContextHelp(),
    new seventyEightHundredBasicContextHelp_1.SeventyEightHundredBasicContextHelp()
];
async function RegisterContextHelpsAsync(context) {
    for (const contextHelp of exports.ContextHelps) {
        await contextHelp.RegisterAsync(context);
    }
}
// -------------------------------------------------------------------------------------
// Functions
// -------------------------------------------------------------------------------------
async function BuildGameAsync() {
    // Get document
    const document = await GetActiveTextEditorDocumentAsync();
    if (!document || document.uri.scheme !== "file")
        return false;
    // Find compiler
    let compiler = configuration.GetChosenCompiler(document);
    if (compiler)
        return await compiler.BuildGameAsync(document);
    // Result
    return false;
}
async function BuildGameAndRunAsync() {
    // Get document
    const document = await GetActiveTextEditorDocumentAsync();
    if (!document || document.uri.scheme !== "file")
        return false;
    // Find compiler
    let compiler = configuration.GetChosenCompiler(document);
    if (compiler)
        return await compiler.BuildGameAndRunAsync(document);
    // Result
    return false;
}
async function LaunchBinaryFileTo7800GDAsync(fileUri) {
    // Validate
    if (!exports.IsWindows) {
        // WINDOWS ONLY - Advise
        WriteToCompilerTerminal('Warning: Sending to 7800GD cart is currently only available for Windows.');
    }
    else {
        // Find
        var serial = exports.Serials.find(s => s.Id === "7800GD");
        if (serial) {
            exports.CompilerOutputChannel.clear();
            return await serial.SendGameAsync(fileUri.fsPath);
        }
    }
    // Result
    return false;
}
function KillBuildGame() {
    // Process all compilers
    for (const compiler of exports.Compilers) {
        if (compiler.IsRunning)
            compiler.Kill();
    }
}
async function OpenContextHelp() {
    // Get active editor
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor)
        return;
    // Find context help (based on language of chosen file)
    const contextHelp = exports.ContextHelps.find(h => h.Id === activeEditor.document.languageId);
    if (!contextHelp)
        return;
    // Open at cursor position
    const position = activeEditor.selection.start;
    await contextHelp.OpenContextHelpAtCursorAsync(activeEditor.document, position);
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
    if (writeToLog)
        console.log(`debugger:${message}`);
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
async function ValidateOpenDocumentsOnStartup(context) {
    // Validate all open documents
    const openDocuments = vscode.workspace.textDocuments;
    for (const doc of openDocuments) {
        // Scan/process each existing open document
        tags.ScanDocumentForADSLanguageTag(doc);
    }
}
async function ShowStartupMessages(context) {
    // Prepare
    const config = configuration.GetAtariDevStudioConfiguration();
    // Load settings
    const showNewVersionMessage = config.get(`application.configuration.showNewVersionMessage`, true);
    const latestVersion = context.globalState.get(`${exports.Name}.configuration.latestVersion`);
    // Process?
    if (!showNewVersionMessage || latestVersion === exports.Version)
        return;
    // Set latest version
    await context.globalState.update(`${exports.Name}.configuration.latestVersion`, exports.Version);
    // buttons
    const latestChanges = "Learn more about the latest changes";
    const dontShowMeThisMessage = "Don't show me this message again";
    // Show prompt and validate
    const selection = await vscode.window.showInformationMessage(`Welcome to the new version of ${exports.DisplayName}`, latestChanges, dontShowMeThisMessage);
    if (selection === latestChanges) {
        // Show changelog
        await vscode.env.openExternal(exports.ChangeLogUri);
    }
    else if (selection === dontShowMeThisMessage) {
        // Disable (await to ensure persisted)
        await config.update(`application.configuration.showNewVersionMessage`, false, vscode.ConfigurationTarget.Global);
    }
}
async function GetActiveTextEditorDocumentAsync() {
    // Ensure coding area active before reading current document
    await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
    // Try current document
    let editor = vscode.window.activeTextEditor;
    if (editor)
        return editor.document;
    // Nothing
    return null;
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

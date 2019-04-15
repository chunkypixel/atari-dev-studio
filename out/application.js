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
const path = require("path");
const filesystem = require("./filesystem");
const os = require("os");
const batariBasicCompiler_1 = require("./compilers/batariBasicCompiler");
const seventyEightHundredBasicCompiler_1 = require("./compilers/seventyEightHundredBasicCompiler");
const dasmCompiler_1 = require("./compilers/dasmCompiler");
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
// Operating System
// -------------------------------------------------------------------------------------
function OSPlatform() { return os.platform(); }
exports.OSPlatform = OSPlatform;
function OsArch() { return os.arch(); }
exports.OsArch = OsArch;
function IsWindows() { return os.platform() === 'win32'; }
exports.IsWindows = IsWindows;
function IsLinux() { return os.platform() === 'linux'; }
exports.IsLinux = IsLinux;
function IsMacOS() { return os.platform() === 'darwin'; }
exports.IsMacOS = IsMacOS;
function Is32Bit() { return os.arch() === 'x32'; }
exports.Is32Bit = Is32Bit;
function Is64Bit() { return os.arch() === 'x64'; }
exports.Is64Bit = Is64Bit;
// -------------------------------------------------------------------------------------
// Extension
// -------------------------------------------------------------------------------------
exports.ExtensionId = "chunkypixel.atari-dev-studio";
function Path() {
    // Attempt to read
    try {
        return vscode.extensions.getExtension(exports.ExtensionId).extensionPath;
    }
    catch (error) {
    }
    return "unknown";
}
exports.Path = Path;
function Version() {
    // Attempt to read
    try {
        return `v${vscode.extensions.getExtension(exports.ExtensionId).packageJSON.version}`;
    }
    catch (error) {
    }
    return "unknown";
}
exports.Version = Version;
function DisplayName() {
    // Attempt to read
    try {
        return vscode.extensions.getExtension(exports.ExtensionId).packageJSON.displayName;
    }
    catch (error) {
    }
    return "unknown";
}
exports.DisplayName = DisplayName;
function Description() {
    // Attempt to read
    try {
        return vscode.extensions.getExtension(exports.ExtensionId).packageJSON.description;
    }
    catch (error) {
    }
    return "unknown";
}
exports.Description = Description;
function BuildGameAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get file extension to determine compiler
        fileUri = yield filesystem.GetFileUri(fileUri);
        if (!fileUri)
            return false;
        // Find compiler
        let fileExtension = path.extname(fileUri.fsPath).toLowerCase();
        for (const compiler of exports.Compilers) {
            if (compiler.CompilerExtensions.includes(fileExtension)) {
                return yield compiler.BuildGameAsync(fileUri);
            }
        }
        // Not found
        let message = `Unable to find a compiler for extension ${fileExtension}.`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return false;
    });
}
exports.BuildGameAsync = BuildGameAsync;
function BuildGameAndRunAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get file extension to determine compiler
        fileUri = yield filesystem.GetFileUri(fileUri);
        if (!fileUri)
            return false;
        // Find compiler
        let fileExtension = path.extname(fileUri.fsPath).toLowerCase();
        for (const compiler of exports.Compilers) {
            if (compiler.CompilerExtensions.includes(fileExtension)) {
                return yield compiler.BuildGameAndRunAsync(fileUri);
            }
        }
        // Not found
        let message = `Unable to find a compiler for extension ${fileExtension}.`;
        vscode.window.showErrorMessage(message);
        console.log(message);
        return false;
    });
}
exports.BuildGameAndRunAsync = BuildGameAndRunAsync;
//# sourceMappingURL=application.js.map
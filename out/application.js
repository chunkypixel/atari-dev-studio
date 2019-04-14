"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
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
//# sourceMappingURL=application.js.map
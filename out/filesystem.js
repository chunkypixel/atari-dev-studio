// ...existing code...
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
exports.FileExistsAsync = FileExistsAsync;
exports.RenameFileAsync = RenameFileAsync;
exports.GetFileStatsAsync = GetFileStatsAsync;
exports.RemoveFileAsync = RemoveFileAsync;
exports.FolderExistsAsync = FolderExistsAsync;
exports.MkDirAsync = MkDirAsync;
exports.ChModAsync = ChModAsync;
exports.ReadFileAsync = ReadFileAsync;
exports.WriteFileAsync = WriteFileAsync;
exports.WorkspaceFolder = WorkspaceFolder;
exports.GetFileExtension = GetFileExtension;
const vscode = __importStar(require("vscode"));
const application = __importStar(require("./application"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
async function FileExistsAsync(filePath) {
    try {
        await fs_1.promises.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
async function RenameFileAsync(oldName, newName) {
    try {
        await fs_1.promises.rename(oldName, newName);
        return true;
    }
    catch {
        return false;
    }
}
async function GetFileStatsAsync(filePath) {
    try {
        const stats = await fs_1.promises.stat(filePath);
        return stats;
    }
    catch {
        return undefined;
    }
}
async function RemoveFileAsync(filePath) {
    try {
        await fs_1.promises.unlink(filePath);
        return true;
    }
    catch {
        return false;
    }
}
async function FolderExistsAsync(folder) {
    try {
        await fs_1.promises.access(folder);
        return true;
    }
    catch {
        return false;
    }
}
async function MkDirAsync(folder) {
    try {
        await fs_1.promises.mkdir(folder, { recursive: true });
        return true;
    }
    catch {
        return false;
    }
}
async function ChModAsync(filePath, mode = 0o777) {
    try {
        await fs_1.promises.chmod(filePath, mode);
        return true;
    }
    catch (err) {
        application.WriteToCompilerTerminal(`- failed to set chmod permissions: ${err?.message ?? err}`, true, false);
        return false;
    }
}
async function ReadFileAsync(filePath, encoding) {
    try {
        const data = await fs_1.promises.readFile(filePath, encoding);
        return data;
    }
    catch {
        return undefined;
    }
}
async function WriteFileAsync(filePath, data) {
    try {
        await fs_1.promises.writeFile(filePath, data);
        return true;
    }
    catch {
        return false;
    }
}
function WorkspaceFolder() {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return "";
}
function GetFileExtension(uri) {
    return path.extname(uri.fsPath);
}
//# sourceMappingURL=filesystem.js.map
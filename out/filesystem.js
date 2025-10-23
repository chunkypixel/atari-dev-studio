// ...existing code...
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
const vscode = require("vscode");
const application = require("./application");
const path = require("path");
const fs_1 = require("fs");
function FileExistsAsync(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.access(filePath);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function RenameFileAsync(oldName, newName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.rename(oldName, newName);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function GetFileStatsAsync(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stats = yield fs_1.promises.stat(filePath);
            return stats;
        }
        catch (_a) {
            return undefined;
        }
    });
}
function RemoveFileAsync(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.unlink(filePath);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function FolderExistsAsync(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.access(folder);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function MkDirAsync(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.mkdir(folder, { recursive: true });
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function ChModAsync(filePath_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, mode = 0o777) {
        var _a;
        try {
            yield fs_1.promises.chmod(filePath, mode);
            return true;
        }
        catch (err) {
            application.WriteToCompilerTerminal(`- failed to set chmod permissions: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : err}`, true, false);
            return false;
        }
    });
}
function ReadFileAsync(filePath, encoding) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs_1.promises.readFile(filePath, encoding);
            return data;
        }
        catch (_a) {
            return undefined;
        }
    });
}
function WriteFileAsync(filePath, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs_1.promises.writeFile(filePath, data);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
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
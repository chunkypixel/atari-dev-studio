"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const filesystem = require("./filesystem");
const os = require("os");
const batariBasicCompiler_1 = require("./compilers/batariBasicCompiler");
const seventyEightHundredBasicCompiler_1 = require("./compilers/seventyEightHundredBasicCompiler");
const dasmCompiler_1 = require("./compilers/dasmCompiler");
const stellaEmulator_1 = require("./emulators/stellaEmulator");
const a7800Emulator_1 = require("./emulators/a7800Emulator");
exports.Id = "chunkypixel.atari-dev-studio";
exports.Path = vscode.extensions.getExtension(exports.Id).extensionPath;
exports.Name = vscode.extensions.getExtension(exports.Id).packageJSON.name;
exports.Publisher = vscode.extensions.getExtension(exports.Id).packageJSON.publisher;
exports.Version = vscode.extensions.getExtension(exports.Id).packageJSON.version;
exports.DisplayName = vscode.extensions.getExtension(exports.Id).packageJSON.displayName;
exports.Description = vscode.extensions.getExtension(exports.Id).packageJSON.description;
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
// Functions
// -------------------------------------------------------------------------------------
function BuildGameAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        var e_1, _a;
        // Get document
        let document = yield filesystem.GetDocumentAsync(fileUri);
        if (!document || document.uri.scheme != "file")
            return false;
        // Find compiler
        let fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        try {
            for (var Compilers_1 = __asyncValues(exports.Compilers), Compilers_1_1; Compilers_1_1 = yield Compilers_1.next(), !Compilers_1_1.done;) {
                let compiler = Compilers_1_1.value;
                if (compiler.Extensions.includes(fileExtension)) {
                    return yield compiler.BuildGameAsync(document);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (Compilers_1_1 && !Compilers_1_1.done && (_a = Compilers_1.return)) yield _a.call(Compilers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Not found
        Notify(`Unable to find a compiler for extension '${fileExtension}'.`);
        return false;
    });
}
exports.BuildGameAsync = BuildGameAsync;
function BuildGameAndRunAsync(fileUri) {
    return __awaiter(this, void 0, void 0, function* () {
        var e_2, _a;
        // Get document
        let document = yield filesystem.GetDocumentAsync(fileUri);
        if (!document || document.uri.scheme != "file")
            return false;
        // Find compiler
        let fileExtension = path.extname(document.uri.fsPath).toLowerCase();
        try {
            for (var Compilers_2 = __asyncValues(exports.Compilers), Compilers_2_1; Compilers_2_1 = yield Compilers_2.next(), !Compilers_2_1.done;) {
                let compiler = Compilers_2_1.value;
                if (compiler.Extensions.includes(fileExtension)) {
                    return yield compiler.BuildGameAndRunAsync(document);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (Compilers_2_1 && !Compilers_2_1.done && (_a = Compilers_2.return)) yield _a.call(Compilers_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Not found
        Notify(`Unable to find a compiler for extension '${fileExtension}'.`);
        return false;
    });
}
exports.BuildGameAndRunAsync = BuildGameAndRunAsync;
function Notify(message) {
    exports.CompilerOutputChannel.appendLine(message);
    console.log(`debugger:${message}`);
}
exports.Notify = Notify;
//# sourceMappingURL=application.js.map
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
exports.BatchCompiler = void 0;
const path = require("path");
const application = require("../application");
const compilerBase_1 = require("./compilerBase");
class BatchCompiler extends compilerBase_1.CompilerBase {
    // Features
    constructor() {
        super("bat", "Batch", ["bat"], [""], [""], "", "");
    }
    InitialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('debugger:BatchCompiler.InitialiseAsync');
            // Prepare
            let result = true;
            // Already running?
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = application.GetConfiguration();
            // Configuration
            result = yield this.LoadConfigurationAsync();
            if (!result) {
                return false;
            }
            // Initialise terminal
            yield application.InitialiseAdsTerminalAsync();
            // Activate output window?
            if (!this.Configuration.get(`editor.preserveCodeEditorFocus`)) {
                (_a = application.AdsTerminal) === null || _a === void 0 ? void 0 : _a.show();
            }
            // Clear output content? (not available for terminals)
            // Save files (based on user configuration)
            result = yield this.SaveAllFilesBeforeRun();
            if (!result) {
                return false;
            }
            // Result
            return true;
        });
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('debugger:BatchCompiler.ExecuteCompilerAsync');
            // Launch and exit
            // note: we cannot wait for a result
            (_a = application.AdsTerminal) === null || _a === void 0 ? void 0 : _a.sendText(`${this.FileName}`);
            return true;
        });
    }
    LoadConfigurationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:BatchCompiler.LoadConfigurationAsync');
            // System
            this.UsingBatchCompiler = true;
            this.FileName = path.basename(this.Document.fileName);
            // Result
            return true;
        });
    }
}
exports.BatchCompiler = BatchCompiler;
//# sourceMappingURL=batchCompiler.js.map
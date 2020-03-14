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
const application = require("../application");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class MakeCompiler extends compilerBase_1.CompilerBase {
    // Features
    constructor() {
        super("makefile", "makefile", ["makefile"], [""], "", "");
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:MakeCompiler.ExecuteCompilerAsync');
            // Compiler options
            let command = this.FolderOrPath;
            let args = [
                `-f ${this.FileName}`
            ];
            // Env
            let env = {};
            // Notify
            application.CompilerOutputChannel.appendLine(`Starting build of ${this.FileName}...`);
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            }, (stderr) => {
                // Prepare
                let result = false;
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
            this.IsRunning = false;
            // Notify
            application.CompilerOutputChannel.appendLine(`Finished...`);
            // Result
            return executeResult;
        });
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:MakeCompiler.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result) {
                return false;
            }
            // Path
            //this.FolderOrPath = path.join(this.WorkspaceFolder,'make');
            this.FolderOrPath = 'make';
            // Result
            return true;
        });
    }
}
exports.MakeCompiler = MakeCompiler;
//# sourceMappingURL=makeCompiler.js.map
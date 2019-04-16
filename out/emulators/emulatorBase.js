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
const application = require("../application");
const filesystem = require("../filesystem");
class EmulatorBase {
    constructor(id, name, folderOrPath) {
        this.CustomFolderOrPath = false;
        this.FolderOrPath = "";
        this.Args = "";
        this.File = "";
        this.Id = id;
        this.Name = name;
        this.DefaultFolderOrPath = folderOrPath;
    }
    dispose() {
        console.log('debugger:EmulatorBase.dispose');
    }
    RunGameAsync(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set
            this.File = file;
            // Process
            if (!(yield this.InitialiseAsync()))
                return false;
            return yield this.ExecuteEmulatorAsync();
        });
    }
    InitialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:EmulatorBase.InitialiseAsync');
            // Configuration
            if (!(yield this.LoadConfigurationAsync()))
                return false;
            // Result
            return true;
        });
    }
    LoadConfigurationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:EmulatorBase.LoadConfigurationAsync');
            // Reset
            this.CustomFolderOrPath = false;
            this.FolderOrPath = this.DefaultFolderOrPath;
            this.Args = "";
            // (Re)load
            // It appears you need to reload this each time incase of change
            this.Configuration = vscode.workspace.getConfiguration(application.Name, null);
            // Emulator
            let userEmulatorPath = this.Configuration.get(`${this.Id}.emulatorPath`);
            if (userEmulatorPath) {
                // Validate (user provided)
                let result = yield filesystem.FileExistsAsync(userEmulatorPath);
                if (!result) {
                    // Notify
                    application.Notify(`ERROR: Cannot locate your chosen ${this.Name} emulator path '${userEmulatorPath}'`);
                    return false;
                }
                // Set
                this.FolderOrPath = userEmulatorPath;
                this.CustomFolderOrPath = true;
            }
            // Emulator (Other)
            this.Args = this.Configuration.get(`${this.Id}.emulatorArgs`, "");
            // Result
            return true;
        });
    }
}
exports.EmulatorBase = EmulatorBase;
//# sourceMappingURL=emulatorBase.js.map
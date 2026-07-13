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
exports.EmulatorBase = void 0;
const application = __importStar(require("../application"));
const configuration = __importStar(require("../configuration"));
const filesystem = __importStar(require("../filesystem"));
class EmulatorBase {
    // Features
    Id;
    Name;
    CustomFolderOrPath = false;
    DefaultFolderOrPath;
    FolderOrPath = "";
    Args = "";
    FileName = "";
    Configuration;
    constructor(id, name, folderOrPath) {
        this.Id = id;
        this.Name = name;
        this.DefaultFolderOrPath = folderOrPath;
    }
    dispose() {
        console.log('debugger:EmulatorBase.dispose');
    }
    async RunGameAsync(fileName) {
        // Set
        this.FileName = fileName;
        // Process
        let result = await this.InitialiseAsync();
        if (!result)
            return false;
        return await this.ExecuteEmulatorAsync();
    }
    async InitialiseAsync() {
        console.log('debugger:EmulatorBase.InitialiseAsync');
        // Configuration
        return await this.LoadConfigurationAsync();
    }
    async RepairFilePermissionsAsync() {
        return true;
    }
    async LoadConfigurationAsync() {
        console.log('debugger:EmulatorBase.LoadConfigurationAsync');
        // Reset
        this.CustomFolderOrPath = false;
        this.FolderOrPath = this.DefaultFolderOrPath;
        this.Args = "";
        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = configuration.GetAtariDevStudioConfiguration();
        // Emulator
        let userEmulatorPath = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.path`);
        if (userEmulatorPath) {
            // Validate (user provided)
            let result = await filesystem.FileExistsAsync(userEmulatorPath);
            if (!result) {
                // Notify
                let message = `WARNING: Your chosen ${this.Name} emulator path '${userEmulatorPath}' cannot be found.\nReverting to the default emulator...`;
                application.WriteToCompilerTerminal(message);
                application.WriteToCompilerTerminal("");
                application.ShowWarningPopup(message);
                // // Notify
                // application.WriteToCompilerTerminal(`ERROR: Your chosen ${this.Name} emulator path '${userEmulatorPath}' cannot be found.`);
                // application.WriteToCompilerTerminal(`Reverting to the default emulator...`);
                // application.WriteToCompilerTerminal("");
            }
            else {
                // Set
                this.FolderOrPath = userEmulatorPath;
                this.CustomFolderOrPath = true;
            }
        }
        // Emulator (Other)
        this.Args = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.args`, "");
        // Result
        return true;
    }
}
exports.EmulatorBase = EmulatorBase;

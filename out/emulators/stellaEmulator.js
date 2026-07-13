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
exports.StellaEmulator = void 0;
const path = __importStar(require("path"));
const application = __importStar(require("../application"));
const filesystem = __importStar(require("../filesystem"));
const execute = __importStar(require("../execute"));
const emulatorBase_1 = require("./emulatorBase");
class StellaEmulator extends emulatorBase_1.EmulatorBase {
    // Features
    AutoCloseExistingInstances = true;
    constructor() {
        super("Stella", "Stella", path.join(application.Path, "out", "bin", "emulators", "stella"));
    }
    async LoadConfigurationAsync() {
        console.log('debugger:StellaEmulator.LoadConfigurationAsync');
        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result)
            return false;
        // Emulator
        if (!this.CustomFolderOrPath) {
            // Emulator name (depends on OS)
            var emulatorName = "Stella.exe";
            if (application.IsLinux) {
                emulatorName = "stella";
            }
            else if (application.IsMacOS) {
                emulatorName = "Stella.app";
            }
            // from v7 we now exclude architecture at all platforms ar x64
            this.FolderOrPath = path.join(this.FolderOrPath, application.OSPlatform, emulatorName);
        }
        // Other
        this.AutoCloseExistingInstances = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.autoCloseExistingInstances`, true);
        // Result
        return true;
    }
    async ExecuteEmulatorAsync() {
        console.log('debugger:StellaEmulator.ExecuteEmulatorAsync');
        // Prepare
        application.WriteToCompilerTerminal('');
        // Validate for 32-bit
        if (!this.CustomFolderOrPath && application.Is32Bit) {
            application.WriteToCompilerTerminal(`ERROR: ${application.DisplayName} now only includes 64-bit (Windows, Debian Linux) or ARM M1 and 64-bit Intel (MacOS) versions of Stella (v7 onwards). If you wish to use an older 32-bit version, configure a custom path in the Settings instead (Emulator › Stella: Path).`);
            return false;
        }
        // Premissions
        await this.RepairFilePermissionsAsync();
        // Command
        let command = `"${this.FolderOrPath}"`;
        if (application.IsMacOS)
            command = `open -a "${command}"`;
        // Args
        let args = [
            this.Args,
            `"${this.FileName}"`
        ];
        // Kill any existing process
        if (this.AutoCloseExistingInstances)
            await execute.KillProcessByNameAsync(this.Name);
        // Process
        application.WriteToCompilerTerminal(`Launching ${this.Name} emulator...`);
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FileName), (stdout) => {
            // Prepare
            let result = true;
            // Result
            application.WriteToCompilerTerminal('' + stdout, false);
            return result;
        }, (stderr) => {
            // Prepare
            let result = true;
            // Result
            application.WriteToCompilerTerminal('' + stderr, false);
            return result;
        });
        // Result
        return executeResult;
    }
    async RepairFilePermissionsAsync() {
        console.log('debugger:StellaEmulator.RepairFilePermissionsAsync');
        // Validate
        if (this.CustomFolderOrPath || application.IsWindows)
            return true;
        // Process
        let result = await filesystem.ChModAsync(this.FolderOrPath);
        // Attempt to mark Stella as execute #19
        if (result && application.IsMacOS)
            result = await filesystem.ChModAsync(path.join(this.FolderOrPath, `Contents/MacOS/Stella`));
        if (result && application.IsLinux)
            result = await filesystem.ChModAsync(this.FolderOrPath);
        // Result
        return result;
    }
}
exports.StellaEmulator = StellaEmulator;

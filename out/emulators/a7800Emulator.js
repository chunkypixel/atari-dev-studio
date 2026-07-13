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
exports.A7800Emulator = void 0;
const path = __importStar(require("path"));
const application = __importStar(require("../application"));
const filesystem = __importStar(require("../filesystem"));
const execute = __importStar(require("../execute"));
const emulatorBase_1 = require("./emulatorBase");
class A7800Emulator extends emulatorBase_1.EmulatorBase {
    // Features
    Region = "";
    Console = "";
    Debugger = false;
    // Lists (to match settings)
    // Hopefully one-day I'll work out how to hot-load into settings
    // so we can dynamically configure
    RegionList = new Map([
        ["Atari 7800 (NTSC) Cool", "a7800u1"],
        ["Atari 7800 (NTSC) Warm", "a7800"],
        ["Atari 7800 (NTSC) Hot", "a7800u2"],
        ["Atari 7800 (NTSC) Developer Mode", "a7800dev"],
        ["Atari 7800 (PAL) Cool", "a7800pu1"],
        ["Atari 7800 (PAL) Warm", "a7800p"],
        ["Atari 7800 (PAL) Hot", "a7800pu2"],
        ["Atari 7800 (PAL) Developer Mode", "a7800pdev"]
    ]);
    ConsoleList = new Map([
        ["Standard Console", ""],
        ["High Score Cartridge", "hiscore"],
        ["XBoarD Expansion", "xboard"],
        ["XM Expansion Module", "xm"]
    ]);
    constructor() {
        super("A7800", "A7800", path.join(application.Path, "out", "bin", "emulators", "a7800"));
    }
    async LoadConfigurationAsync() {
        console.log('debugger:A7800Emulator.LoadConfigurationAsync');
        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result)
            return false;
        // Reset
        this.Region = "";
        this.Console = "";
        this.Debugger = false;
        // Emulator
        if (!this.CustomFolderOrPath) {
            if (application.IsWindows) {
                this.FolderOrPath = path.join(this.FolderOrPath, "A7800.exe");
            }
            else if (application.IsLinux || application.IsMacOS) {
                // Prepare
                let architecture = "Linux";
                if (application.IsMacOS)
                    architecture = "Darwin";
                // Set
                this.FolderOrPath = path.join(this.FolderOrPath, `a7800.${architecture}`);
            }
        }
        // Emulator (Other)
        let userRegion = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.region`, "");
        if (userRegion) {
            // Confirm from list
            for (let [name, id] of this.RegionList) {
                if (name === userRegion) {
                    this.Region = id;
                    break;
                }
            }
        }
        let userConsole = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.console`, "");
        if (userConsole) {
            // Confirm from list
            for (let [name, id] of this.ConsoleList) {
                if (name === userConsole) {
                    this.Console = id;
                    break;
                }
            }
        }
        this.Debugger = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.debugger`, false);
        // Result
        return true;
    }
    async ExecuteEmulatorAsync() {
        console.log('debugger:A7800Emulator.ExecuteEmulatorAsync');
        // Prepare
        application.CompilerOutputChannel.appendLine('');
        // Premissions
        await this.RepairFilePermissionsAsync();
        // Command
        let command = `"${this.FolderOrPath}"`;
        // Args
        // Make sure we send nodebug where config is being saved
        let args = [
            `${this.Region} -cart1`,
            (this.Console ? `${this.Console} -cart2` : ""),
            `"${this.FileName}"`,
            (this.Debugger ? `-debug` : "-nodebug"),
            this.Args
        ];
        // NOTE: This may need to be moved before compilation as it appears MAME is holding onto the launched file.
        //       Also need to confirm actual name to search for.
        // Kill any existing process
        await execute.KillProcessByNameAsync(this.Name);
        // Process
        application.WriteToCompilerTerminal(`Launching ${this.Name} emulator...`);
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FolderOrPath), (stdout) => {
            // Prepare
            let result = true;
            // Result
            application.WriteToCompilerTerminal(stdout, false);
            return result;
        }, (stderr) => {
            // Prepare
            let result = true;
            // Result
            application.WriteToCompilerTerminal(stderr, false);
            return result;
        });
        // Result
        return executeResult;
    }
    async RepairFilePermissionsAsync() {
        console.log('debugger:A7800Emulator.RepairFilePermissionsAsync');
        // Validate
        if (this.CustomFolderOrPath || application.IsWindows)
            return true;
        // Process
        let result = await filesystem.ChModAsync(this.FolderOrPath);
        return result;
    }
}
exports.A7800Emulator = A7800Emulator;

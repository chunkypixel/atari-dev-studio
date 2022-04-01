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
exports.A7800Emulator = void 0;
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const emulatorBase_1 = require("./emulatorBase");
class A7800Emulator extends emulatorBase_1.EmulatorBase {
    constructor() {
        super("A7800", "A7800", path.join(application.Path, "out", "bin", "emulators", "a7800"));
        // Features
        this.Region = "";
        this.Console = "";
        this.Debugger = false;
        // Lists (to match settings)
        // Hopefully one-day I'll work out how to hot-load into settings
        // so we can dynamically configure
        this.RegionList = new Map([
            ["Atari 7800 (NTSC) Cool", "a7800"],
            ["Atari 7800 (NTSC) Warm", "a7800u1"],
            ["Atari 7800 (NTSC) Hot", "a7800u2"],
            ["Atari 7800 (NTSC) Developer Mode", "a7800dev"],
            ["Atari 7800 (PAL) Cool", "a7800p"],
            ["Atari 7800 (PAL) Warm", "a7800pu1"],
            ["Atari 7800 (PAL) Hot", "a7800pu2"],
            ["Atari 7800 (PAL) Developer Mode", "a7800pdev"]
        ]);
        this.ConsoleList = new Map([
            ["Standard Console", ""],
            ["High Score Cartridge", "hiscore"],
            ["XBoarD Expansion", "xboard"],
            ["XM Expansion Module", "xm"]
        ]);
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:A7800Emulator.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result) {
                return false;
            }
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
                    if (application.IsMacOS) {
                        architecture = "Darwin";
                    }
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
        });
    }
    ExecuteEmulatorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:A7800Emulator.ExecuteEmulatorAsync');
            // Prepare
            application.CompilerOutputChannel.appendLine('');
            // Premissions
            yield this.RepairFilePermissionsAsync();
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
            yield execute.KillProcessByNameAsync(this.Name);
            // Process
            application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);
            // Launch
            let executeResult = yield execute.Spawn(command, args, null, path.dirname(this.FolderOrPath), (stdout) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });
            // Result
            return executeResult;
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:A7800Emulator.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows) {
                return true;
            }
            // Process
            let result = yield filesystem.ChModAsync(this.FolderOrPath);
            return result;
        });
    }
}
exports.A7800Emulator = A7800Emulator;
//# sourceMappingURL=a7800Emulator.js.map
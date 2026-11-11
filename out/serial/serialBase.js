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
exports.SerialBase = void 0;
const application = __importStar(require("../application"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class SerialBase {
    Id;
    Name;
    FolderOrPath = "";
    FileName = "";
    constructor(id, name, folderOrPath) {
        this.Id = id;
        this.Name = name;
        this.FolderOrPath = folderOrPath;
    }
    async SendGameAsync(fileName) {
        // Set
        this.FileName = fileName;
        // Process
        return await this.ExecuteSerialAsync();
    }
    async InitialiseAsync() {
        console.log('debugger:SerialBase.InitialiseAsync');
        // Configuration
        return await this.LoadConfigurationAsync();
    }
    async LoadConfigurationAsync() {
        console.log('debugger:SerialBase.LoadConfigurationAsync');
        // Result
        return true;
    }
    /**
     * Automatically attempts to find a connected 7800GD cartridge port path.
     * Falls back to returning undefined if no active ports are identified.
     */
    async AutoDetectComPort() {
        try {
            // --- 1. LINUX AUTO-DETECTION ---
            if (application.IsLinux) {
                const stableIdPath = '/dev/serial/by-id';
                if (fs.existsSync(stableIdPath)) {
                    const files = fs.readdirSync(stableIdPath);
                    // 1. Prioritize RetroHQ / 7800 / FTDI devices first
                    const priorityMatch = files.find(file => {
                        const lower = file.toLowerCase();
                        return lower.includes('retrohq') ||
                            lower.includes('7800') ||
                            lower.includes('ftdi');
                    });
                    if (priorityMatch) {
                        return path.join(stableIdPath, priorityMatch);
                    }
                    // 2. Fallback to any other USB serial device in by-id
                    const genericUsbMatch = files.find(file => file.toLowerCase().startsWith('usb-'));
                    if (genericUsbMatch) {
                        return path.join(stableIdPath, genericUsbMatch);
                    }
                }
                // 3. Final fallback to standard virtual TTY interfaces
                const ttyDevices = ['/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyACM1'];
                for (const dev of ttyDevices) {
                    if (fs.existsSync(dev)) {
                        return dev;
                    }
                }
            }
            // --- 2. MACOS AUTO-DETECTION ---
            if (application.IsMacOS) {
                if (fs.existsSync('/dev')) {
                    const files = fs.readdirSync('/dev');
                    const match = files.find(file => {
                        const lower = file.toLowerCase();
                        return lower.startsWith('cu.') &&
                            (lower.includes('usb') || lower.includes('serial') || lower.includes('slab'));
                    });
                    if (match) {
                        return path.join('/dev', match);
                    }
                }
            }
            // --- 3. WINDOWS AUTO-DETECTION ---
            if (application.IsWindows) {
                // Uses simple wildcard matching in PowerShell to avoid regex escaping issues
                const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.Caption -like '*(COM*' } | Select-Object -ExpandProperty Caption"`;
                const { stdout } = await execAsync(cmd);
                if (stdout) {
                    const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    // 1. Prioritize USB-based serial adapters (skips built-in motherboard COM1 ports)
                    const usbSerialPorts = lines.find(line => {
                        const lower = line.toLowerCase();
                        return lower.includes('usb serial') ||
                            lower.includes('usb-serial') ||
                            lower.includes('ftdi') ||
                            lower.includes('retrohq') ||
                            lower.includes('7800');
                    });
                    const targetLine = usbSerialPorts;
                    if (targetLine) {
                        const comMatch = targetLine.match(/\((COM\d+)\)/i);
                        const portName = comMatch?.slice(1).shift();
                        if (portName) {
                            return portName.toUpperCase(); // Returns "COM4"
                        }
                    }
                }
            }
        }
        catch (error) {
            application.WriteToCompilerTerminal(`Failed auto-detecting 7800GD serial link: ${error instanceof Error ? error.message : String(error)}`);
        }
        return undefined; // No reliable port auto-detected
    }
}
exports.SerialBase = SerialBase;
//# sourceMappingURL=serialBase.js.map
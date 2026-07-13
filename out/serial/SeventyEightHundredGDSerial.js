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
exports.SeventyEightHundredGDSerial = void 0;
const path = __importStar(require("path"));
const application = __importStar(require("../application"));
const configuration = __importStar(require("../configuration"));
const execute = __importStar(require("../execute"));
const serialBase_1 = require("./serialBase");
class SeventyEightHundredGDSerial extends serialBase_1.SerialBase {
    constructor() {
        super("7800GD", "7800GD", path.join(application.Path, "out", "bin", "serial", "7800gd", "7800cmd.exe"));
    }
    async ExecuteSerialAsync() {
        console.log('debugger:SeventyEightHundredGDSerial.ExecuteSerialAsync');
        // Prepare
        const config = configuration.GetAtariDevStudioConfiguration();
        application.WriteToCompilerTerminal();
        // Load
        var comPort = config.get(`launch.emulatorOrCartComPort`, "Emulator").toLowerCase();
        let command = `"${this.FolderOrPath}"`;
        // Args
        let args = [
            `-com ${comPort}`,
            `-run "${this.FileName}"`
        ];
        // Process
        application.WriteToCompilerTerminal(`Launching ${this.Name} serial process...`);
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FolderOrPath), (stdout) => {
            // Prepare
            let result = true;
            // Sanitize output
            // need to remove +\b from messages (looks a bit nicer)
            var pattern = /[+][\b]+/gi;
            stdout = stdout.replace(pattern, "");
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
}
exports.SeventyEightHundredGDSerial = SeventyEightHundredGDSerial;

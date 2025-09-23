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
exports.installAsync = installAsync;
const util_1 = require("util");
const application = require("./application");
const cp = require("child_process");
// Promisify exec for async/await usage
const execPromise = (0, util_1.promisify)(cp.exec);
function installAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        // Process?
        var configuration = application.GetConfiguration();
        if (!configuration.get(`application.configuration.doWasmtimeCheck`)) {
            application.WriteToCompilerTerminal(`- Wasmtime validation has been turned off in the Settings.`);
            return;
        }
        // First, check if Wasmtime is already installed
        try {
            const { stdout } = yield execPromise('wasmtime --version', { shell: true });
            if (stdout.includes('wasmtime')) {
                application.WriteToCompilerTerminal(`- ${stdout.trim()} installed`);
                return;
            }
        }
        catch (error) {
            // Error means Wasmtime is likely not installed, proceed to installation
        }
        // No! prepare to install it
        let command;
        if (application.IsLinux || application.IsMacOS) {
            // Install script using curl
            command = 'curl https://wasmtime.dev/install.sh -sSf | bash';
        }
        else if (application.IsWindows) {
            // Get Windows version
            const majorVersion = parseInt(application.OSRelease.split('.')[0], 10);
            const buildNumber = parseInt(application.OSRelease.split('.')[2] || '0', 10);
            // Windows 7 (6.1), Windows 10 (10.0, build < 22000), Windows 11 (10.0, build >= 22000)
            if (majorVersion === 6 && application.OSRelease.startsWith('6.1')) {
                // Windows 7: winget not supported
                application.WriteToCompilerTerminal('Wasmtime automated installation (via winget) is not supported on Windows 7. Download and install manually from https://wasmtime.dev/.');
                return;
            }
            else if (majorVersion >= 10) {
                // Windows 10 or 11: use winget
                command = 'winget install --id=BytecodeAlliance.Wasmtime --silent --accept-package-agreements --accept-source-agreements';
            }
            else {
                // Unknown/unsupported Windows version
                application.WriteToCompilerTerminal('Wasmtime installation may not supported on this Windows version. Download and install manually from https://wasmtime.dev/.');
                return;
            }
        }
        else {
            application.WriteToCompilerTerminal('Wasmtime installation may not be supported on this platform. Download and install manually from https://wasmtime.dev/');
            return;
        }
        // Execute the installation
        application.WriteToCompilerTerminal();
        application.WriteToCompilerTerminal('Attempting to install Wasmtime. This may take a few minutes...');
        try {
            const { stdout, stderr } = yield execPromise(command, { cwd: undefined, shell: true });
            if (stderr) {
                // NOTE: stderr is verbose and really unnecessary for our use (e.g., cmd progress bars)
                //application.WriteToCompilerTerminal(stderr);
            }
            if (stdout) {
                // NOTE: includes a list of files unpacked (linux) so will leave for now
                application.WriteToCompilerTerminal(stdout);
            }
            application.WriteToCompilerTerminal('Wasmtime installation complete! Depending on your operating system you may need to restart VS Code or your machine for changes to take effect.');
        }
        catch (error) {
            if (application.IsMacOS) {
                application.WriteToCompilerTerminal(`Failed to install Wasmtime: ${error.message}. Ensure Homebrew is installed[](https://brew.sh/) or that the curl install script completed successfully. Alternatively, download and install manually from https://wasmtime.dev/.`);
            }
            else {
                application.WriteToCompilerTerminal(`Failed to install Wasmtime: ${error.message}. Download and install manually from https://wasmtime.dev/.`);
            }
        }
    });
}
//# sourceMappingURL=wasmtime.js.map
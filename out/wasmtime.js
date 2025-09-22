"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const application = require("./application");
const cp = require("child_process");
function install() {
    // Process?
    var configuration = application.GetConfiguration();
    if (!configuration.get(`application.configuration.doWasmtimeCheck`)) {
        application.WriteToCompilerTerminal(`- Wasmtime validation has been turned off in the Settings.`);
        return;
    }
    // First, check if Wasmtime is already installed
    cp.exec('wasmtime --version', { shell: true }, (error, stdout, stderr) => {
        // Is it?
        if (!error && stdout.includes('wasmtime')) {
            application.WriteToCompilerTerminal(`- Wasmtime installed (${stdout.trim()})`);
            //vscode.window.showInformationMessage(`Wasmtime is already installed (${stdout.trim()}). No action needed.`);
            return;
        }
        // No! so lets prepare to install it
        let command;
        if (application.IsLinux) {
            // Official install script for Linux
            command = 'curl https://wasmtime.dev/install.sh -sSf | bash';
        }
        else if (application.IsMacOS) {
            // Check if Homebrew is installed; if not, fall back to curl script
            command = 'command -v brew >/dev/null 2>&1 && brew install wasmtime || curl https://wasmtime.dev/install.sh -sSf | bash';
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
        application.WriteToCompilerTerminal(`Attempting to install Wasmtime.  This may take a few minutes...`);
        const execOptions = { cwd: undefined, shell: true };
        cp.exec(command, execOptions, (error, stdout, stderr) => {
            if (error) {
                if (application.IsMacOS) {
                    application.WriteToCompilerTerminal(`Failed to install Wasmtime: ${error.message}. Ensure Homebrew is installed (https://brew.sh/) or that the curl install script completed successfully. Alternatively, download and install manually from from https://wasmtime.dev/.`);
                }
                else {
                    application.WriteToCompilerTerminal(`Failed to install Wasmtime: ${error.message}. Download and install manually from https://wasmtime.dev/.`);
                }
                return;
            }
            if (stderr) {
                application.WriteToCompilerTerminal(`Wasmtime installation warnings: ${stderr}`);
            }
            // NOTE: the stdout is very comprehensive and really doesn't need displaying ie. cmd progress bars etc
            //application.WriteToCompilerTerminal(`Wasmtime installed successfully: ${stdout}`);
            application.WriteToCompilerTerminal('Wasmtime installion complete! Depending on your operating system you may need to restart VS Code or your machine for changes to take effect.');
        });
    });
}
//# sourceMappingURL=wasmtime.js.map
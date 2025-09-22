"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = install;
const vscode = require("vscode");
const application = require("./application");
const cp = require("child_process");
function install() {
    // First, check if Wasmtime is already installed
    cp.exec('wasmtime --version', { shell: true }, (error, stdout, stderr) => {
        // Is it?
        if (!error && stdout.includes('wasmtime')) {
            console.log(`Wasmtime already installed: ${stdout.trim()}`);
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
                vscode.window.showErrorMessage('Wasmtime installation via winget is not supported on Windows 7. Please download and install manually from https://wasmtime.dev/.');
                return;
            }
            else if (majorVersion === 10) {
                // Windows 10 or 11: use winget
                command = 'winget install --id=BytecodeAlliance.Wasmtime --silent --accept-package-agreements --accept-source-agreements';
            }
            else {
                // Unknown/unsupported Windows version
                vscode.window.showErrorMessage('Wasmtime installation not supported on this Windows version. Please install manually from https://wasmtime.dev/.');
                return;
            }
        }
        else {
            vscode.window.showErrorMessage('Wasmtime installation not supported on this platform.');
            return;
        }
        // Execute the installation
        console.log(`Attempting to install Wasmtime...`);
        const execOptions = { cwd: undefined, shell: true };
        cp.exec(command, execOptions, (error, stdout, stderr) => {
            if (error) {
                console.error(`Wasmtime installation failed: ${error.message}`);
                if (application.IsMacOS) {
                    vscode.window.showErrorMessage(`Failed to install Wasmtime: ${error.message}. Ensure Homebrew is installed (https://brew.sh/) or that the curl install script completed successfully. Alternatively, install manually from https://wasmtime.dev/.`);
                }
                else {
                    vscode.window.showErrorMessage(`Failed to install Wasmtime: ${error.message}. Please install manually from https://wasmtime.dev/.`);
                }
                return;
            }
            if (stderr) {
                console.warn(`Wasmtime installation warnings: ${stderr}`);
            }
            console.log(`Wasmtime installed successfully: ${stdout}`);
            vscode.window.showInformationMessage('Wasmtime installed! You may need to restart VS Code for changes to take effect.');
        });
    });
}
//# sourceMappingURL=wasmtime.js.map
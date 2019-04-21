"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const application = require("./application");
class StatusBar {
    constructor() {
        this.Initialise();
    }
    Initialise() {
        // Prepare
        let configuration = application.GetConfiguration();
        // Github: https://github.com/chunkypixel/atari-dev-studio/issues/5
        //         Option to turn off/on
        // Show commands?
        if (configuration.get(`editor.showStatusBarCommands`, true)) {
            const itemOptions = [
                { text: `     ${application.DisplayName} (v${application.Version})` },
                { tooltip: 'Welcome', text: '$(home)', command: 'extension.openWelcomePage' },
                { tooltip: 'Compile source code', text: '$(triangle-right)', command: 'extension.buildGame' },
                { tooltip: 'Compile source code and run in emulator', text: '$(rocket)', command: 'extension.buildGameAndRun' }
            ];
            // register
            itemOptions.forEach(option => this.createItem(option));
        }
        ;
    }
    createItem(option, alignment, priority) {
        // Create
        let item = vscode.window.createStatusBarItem(alignment, priority);
        item.command = option.command;
        item.text = option.text;
        item.tooltip = option.tooltip;
        // Display
        item.show();
    }
}
const statusbar = new StatusBar();
exports.default = statusbar;
//# sourceMappingURL=statusbar.js.map
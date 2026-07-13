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
const vscode = __importStar(require("vscode"));
const application = __importStar(require("./application"));
const configuration = __importStar(require("./configuration"));
class StatusBar {
    constructor() {
        this.Initialise();
    }
    Initialise() {
        // Prepare
        let config = configuration.GetAtariDevStudioConfiguration();
        // Github: https://github.com/chunkypixel/atari-dev-studio/issues/5
        //         Option to turn off/on
        // Validate
        let command = config.get('editor.statusBarCommands', 'Full');
        if (command === "None")
            return;
        // Spacer
        let itemOptions = [
            { text: `   ` },
        ];
        itemOptions.forEach(option => this.createItem(option));
        // Name and version
        if (command === "Full") {
            let itemOptions = [
                { text: `${application.DisplayName} (v${application.Version})` },
            ];
            itemOptions.forEach(option => this.createItem(option));
        }
        // Buttons
        if (command === "Full" || command === "Minimum") {
            let itemOptions = [
                { tooltip: 'Welcome', text: '$(home)', command: 'extension.openWelcomePage' },
                { tooltip: 'Learning Center', text: '$(preview)', command: 'extension.openLearningCenterPage' },
                { tooltip: 'Compile source code (Shift+F5)', text: '$(play)', command: 'extension.buildGame' },
                { tooltip: 'Compile source code and launch [via emulator or cart] (F5)', text: '$(rocket)', command: 'extension.buildGameAndRun' },
                { tooltip: 'Sprite Editor', text: '$(tools)', command: 'extension.openSpriteEditorPage' },
                { tooltip: 'PlayerPal Editor (2600)', text: '$(globe)', command: 'extension.openPlayerPalPage' },
                { tooltip: 'Atari Background Builder Editor (2600)', text: '$(globe)', command: 'extension.openAtariBackgroundBuilderPage' },
                { tooltip: 'RT bB Sprite Editor (2600)', text: '$(globe)', command: 'extension.openRTbBSpriteEditorPage' }
            ];
            itemOptions.forEach(option => this.createItem(option));
        }
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

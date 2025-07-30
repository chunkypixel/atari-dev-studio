"use strict";
import * as vscode from 'vscode';
import * as application from './application';

class StatusBar {
    
    constructor() {
        this.Initialise();
    }

    private Initialise(): void {
        // Prepare
	    let configuration = application.GetConfiguration();

        // Github: https://github.com/chunkypixel/atari-dev-studio/issues/5
        //         Option to turn off/on
    
        // Prepare
        let command = (configuration.get<string>('editor.statusBarCommands','Full'));
        if (command === "None") { return; }

        // Spacer
        let itemOptions = [
            { text: `   `},
        ];
        itemOptions.forEach(option => this.createItem(option));

        // Name and version
        if (command === "Full") {
            let itemOptions = [
                { text: `${application.DisplayName} (v${application.Version})`},
            ];
            itemOptions.forEach(option => this.createItem(option));
        }

        // Buttons
        if (command === "Full" || command === "Minimum") {
            let itemOptions = [
                { tooltip: 'Welcome', text: '$(home)', command: 'extension.openWelcomePage' },
                { tooltip: 'Compile source code (Shift+F5)', text: '$(play)', command: 'extension.buildGame' },
                { tooltip: 'Compile source code and launch [via emulator or cart] (F5)', text: '$(rocket)', command: 'extension.buildGameAndRun'},
                { tooltip: 'Sprite Editor', text: '$(tools)', command: 'extension.openSpriteEditorPage' },
                { tooltip: 'PlayerPal Editor (2600)', text: '$(globe)', command: 'extension.openPlayerPalPage' },
                { tooltip: 'Atari Background Builder Editor (2600)', text: '$(globe)', command: 'extension.openAtariBackgroundBuilderPage' },
                { tooltip: 'RT bB Sprite Editor (2600)', text: '$(globe)', command: 'extension.openRTbBSpriteEditorPage' }
            ];
            itemOptions.forEach(option => this.createItem(option));
        }
    }

    private createItem(option: any, alignment?: vscode.StatusBarAlignment | undefined, priority?: number | undefined): void {
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
export default statusbar;
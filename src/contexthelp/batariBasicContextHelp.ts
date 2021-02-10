"use strict";
import { ExtensionContext, Uri } from 'vscode';
import { ContextHelpBase } from './contextHelpBase';

export class BatariBasicContextHelp extends ContextHelpBase {
   
    constructor() {
        super("batariBasic",
        "https://randomterrain.com/atari-2600-memories-batari-basic-commands.html");
    }

    public async RegisterAsync(context: ExtensionContext): Promise<void> {
        // Files
        await this.LoadContextHelpFileAsync(context, 'batariBasic.md'); // batariBasic keywords
    }
}
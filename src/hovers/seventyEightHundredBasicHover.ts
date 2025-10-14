"use strict";
import * as vscode from 'vscode';
import * as application from '../application';
import { HoverBase } from './hoverBase';

export class SeventyEightHundredBasicHover extends HoverBase {

    constructor() {
        super(application.SeventyEightHundredBasicLanguageId);
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void> {
        // Files
        await this.LoadHoverFileAsync(context, '7800basic.md'); // 7800basic keywords
        await this.LoadHoverFileAsync(context, '6502.md'); // 6502 opcodes
        await this.LoadHoverFileAsync(context, 'vcs.md'); // Stella & RIOT
        
        // Finalise
        await super.RegisterAsync(context);
    }

}
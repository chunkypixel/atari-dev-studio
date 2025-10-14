"use strict";
import * as vscode from 'vscode';
import * as application from '../application';
import { HoverBase } from './hoverBase';

export class BatariBasicHover extends HoverBase {

    constructor() {
        super(application.BatariBasicLanguageId);
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void> {
        // Files
        await this.LoadHoverFileAsync(context, '6502.md'); // 6502 opcodes
        await this.LoadHoverFileAsync(context, 'vcs.md');  // Stella & RIOT
        
        // Finalise
        await super.RegisterAsync(context);
    }

}
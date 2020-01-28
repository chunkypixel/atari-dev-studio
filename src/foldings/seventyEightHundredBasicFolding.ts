"use strict";
import { FoldingBase } from './foldingBase';

export class SeventyEightHundredBasicFolding extends FoldingBase {
    
    constructor() {
        super("7800basic", ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
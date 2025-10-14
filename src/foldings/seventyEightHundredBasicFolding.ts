"use strict";
import * as application from '../application';
import { FoldingBase } from './foldingBase';

export class SeventyEightHundredBasicFolding extends FoldingBase {
    
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId, 
            ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
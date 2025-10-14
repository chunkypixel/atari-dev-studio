"use strict";
import * as application from '../application';
import { FoldingBase } from './foldingBase';

export class BatariBasicFolding extends FoldingBase {
    
    constructor() {
        super(application.BatariBasicLanguageId, 
            ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
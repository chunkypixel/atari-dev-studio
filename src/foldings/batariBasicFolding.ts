"use strict";
import { FoldingBase } from './foldingBase';

export class BatariBasicFolding extends FoldingBase {
    
    constructor() {
        super("batariBasic", ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
"use strict";
import * as application from '../application';
import { DocumentSymbolProviderBase } from './documentSymbolProviderBase';

export class SeventyEightHundredBasicDocumentSymbolProvider extends DocumentSymbolProviderBase {
    
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId);
    }
}
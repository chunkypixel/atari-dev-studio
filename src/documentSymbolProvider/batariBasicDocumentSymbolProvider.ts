"use strict";
import * as application from '../application';
import { DocumentSymbolProviderBase } from './documentSymbolProviderBase';

export class BatariBasicDocumentSymbolProvider extends DocumentSymbolProviderBase {
    
    constructor() {
        super(application.BatariBasicLanguageId);
    }
}
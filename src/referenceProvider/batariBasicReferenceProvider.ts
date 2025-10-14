"use strict";
import * as application from '../application';
import { ReferenceProviderBase } from './referenceProviderBase';

export class BatariBasicReferenceProvider extends ReferenceProviderBase {
    
    constructor() {
        super(application.BatariBasicLanguageId);
    }
}
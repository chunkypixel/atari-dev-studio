"use strict";
import * as application from '../application';
import { DefinitionProviderBase } from './definitionProviderBase';

export class BatariBasicDefinitionProvider extends DefinitionProviderBase {
    
    constructor() {
        super(application.BatariBasicLanguageId);
    }
}
"use strict";
import * as application from '../application';
import { DefinitionProviderBase } from './definitionProviderBase';

export class SeventyEightHundredBasicDefinitionProvider extends DefinitionProviderBase {
    
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId);
    }
}
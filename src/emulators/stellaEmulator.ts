"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { EmulatorBase } from "./emulatorBase";

export class StellaEmulator extends EmulatorBase {
    
    constructor() {
        super("stella","Stella",path.join(application.Path,"out","bin","emulators","stella"));
    }

}

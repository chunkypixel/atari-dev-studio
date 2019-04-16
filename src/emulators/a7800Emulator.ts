"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { EmulatorBase } from "./emulatorBase";

export class A7800Emulator extends EmulatorBase {
    
    constructor() {
        super("a7800","A7800",path.join(application.Path,"out","bin","emulators","a7800"));
    }

}

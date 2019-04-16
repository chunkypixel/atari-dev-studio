"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { EmulatorBase } from "./emulatorBase";

export class A7800Emulator extends EmulatorBase {
    
    constructor() {
        super("A7800","A7800",path.join(application.Path,"out","bin","emulators","a7800"));
    }

    protected async LoadConfigurationAsync() : Promise<boolean> {
        console.log('debugger:StellaEmulator.LoadConfigurationAsync');

        // Base
        if (!await super.LoadConfigurationAsync()) return false;

        // Emulator
        if (!this.CustomFolderOrPath) {
            // TODO: Set final path
            // // NOTE: currently Linux and macOS must provide path - this will be checked before launch
            // if (application.IsWindows) {
            //     // Append actual file (based on architecture)
            //     this.FolderOrPath = path.join(this.FolderOrPath,application.OSPlatform,application.OSArch,"Stella.exe");
            // }
        }

        // Result
        return true;
    }

    protected async ExecuteEmulatorAsync(): Promise<boolean> {
        console.log('debugger:StellaEmulator.ExecuteEmulatorAsync');

        // Prepare
        application.CompilerOutputChannel.appendLine(''); 

        // Linux and MacOS must provide path (for now)
        if ((application.IsLinux || application.IsMacOS) && !this.FolderOrPath) {
            application.Notify(`WARNING: You must provide a path to your ${this.Id} emulator before you can launch your game.`); 
            return false;
        }

        // TODO: Compiler options

        // Process
        application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);  

        // TODO: Launch

        // Result
        return true;
    }
}

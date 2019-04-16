"use strict";
import * as path from 'path';
import * as application from '../application';
import * as execute from '../execute';
import { EmulatorBase } from "./emulatorBase";

export class A7800Emulator extends EmulatorBase {
    
    constructor() {
        super("A7800","A7800",path.join(application.Path,"out","bin","emulators","a7800"));
    }

    protected async LoadConfigurationAsync() : Promise<boolean> {
        console.log('debugger:A7800Emulator.LoadConfigurationAsync');

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) return false;

        // Emulator
        if (!this.CustomFolderOrPath) {
            // NOTE: currently Linux and macOS must provide path - this will be checked before launch
            if (application.IsWindows) {
                // Append actual file (based on architecture)
                this.FolderOrPath = path.join(this.FolderOrPath,application.OSPlatform,"x32","A7800.exe");
            }
        }

        // Result
        return true;
    }

    protected async ExecuteEmulatorAsync(): Promise<boolean> {
        console.log('debugger:A7800Emulator.ExecuteEmulatorAsync');

        // Prepare
        application.CompilerOutputChannel.appendLine(''); 

        // Linux and MacOS must provide path (for now)
        if ((application.IsLinux || application.IsMacOS) && !this.FolderOrPath) {
            application.Notify(`WARNING: You must provide a path to your ${this.Id} emulator before you can launch your game.`); 
            return false;
        }

        // Compiler options
        let command = this.FolderOrPath;
        // Args
        let args = [
            "a7800",
            "-cart",
            this.Args,
            `"${this.File}"`
        ]
        // Environment
        let env : { [key: string]: string | null } = {};

        // Process
        application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);         
        
        // Launch
        let executeResult = await execute.Spawn(command, args, env, path.dirname(this.FolderOrPath),
            (stdout: string) => {
                // Prepare
                let result = true;

                // Result
                application.CompilerOutputChannel.append('' + stdout);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Result
                application.CompilerOutputChannel.append('' + stderr);
                return result;
            });

        // Result
        return executeResult;
    }
}

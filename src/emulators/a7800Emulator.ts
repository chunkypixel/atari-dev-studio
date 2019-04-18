"use strict";
import * as path from 'path';
import * as filesystem from '../filesystem';
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
            if (application.IsWindows) {
                this.FolderOrPath = path.join(this.FolderOrPath,"A7800.exe");
            }
            // NOTE: there seems to be an issue running the downloadable Linux app
            //       remove for now.
            // else if (application.IsLinux || application.IsMacOS) {
            //     // Prepare
            //     let architecture = "Linux";
            //     if (application.IsMacOS) architecture = "Darwin";
                
            //     // Set
            //     this.FolderOrPath = path.join(this.FolderOrPath,`a7800.${architecture}.x86_64`);
            // }
        }

        // Result
        return true;
    }

    protected async ExecuteEmulatorAsync(): Promise<boolean> {
        console.log('debugger:A7800Emulator.ExecuteEmulatorAsync');

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Prepare
        application.CompilerOutputChannel.appendLine(''); 

        // Linux and MacOS must provide path
        // NOTE: there seems to be an issue running the downloadable Linux app
        //       remove for now.
        if ((application.IsLinux || application.IsMacOS) && !this.CustomFolderOrPath) {
             application.Notify(`ERROR: You must provide a path to your ${this.Id} emulator before you can launch your game. Review your selection in Preference -> Extensions -> ${application.DisplayName}.`); 
             return false;
        }

        // Compiler options
        let command = this.FolderOrPath;
        // Args
        let args = [
            "a7800",
            "-cart",
            this.Args,
            `"${this.FileName}"`
        ]

        // Process
        application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);         
        
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FolderOrPath),
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

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:A7800Emulator.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) return true;

        // Prepare
        let architecture = "Linux";
        if (application.IsMacOS) architecture = "Darwin";

        // Process
        let result = await filesystem.ChModAsync(this.FolderOrPath);
        return result;
    }
}

"use strict";
import * as path from 'path';
import * as application from '../application';
import * as execute from '../execute';
import { EmulatorBase } from "./emulatorBase";

export class StellaEmulator extends EmulatorBase {
    
    // Features
    protected AutoCloseExistingInstances:boolean = true;

    constructor() {
        super("Stella","Stella",path.join(application.Path,"out","bin","emulators","stella"));
    }

    protected async LoadConfigurationAsync() : Promise<boolean> {
        console.log('debugger:StellaEmulator.LoadConfigurationAsync');

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) return false;
        
        // Emulator
        if (!this.CustomFolderOrPath) {
            // Get emulator name
            var emulatorName = "";
            if (application.IsWindows) {
                emulatorName = "Stella.exe";
            }
            else if (application.IsLinux) {
                emulatorName = "stella";     
            }  
            else if (application.IsMacOS) {
                emulatorName = "Stella.app";                      
            }
            // Append path (based on architecture and emulator name)
            this.FolderOrPath = path.join(this.FolderOrPath,application.OSPlatform,application.OSArch,emulatorName);                      
        }

        // Other
        this.AutoCloseExistingInstances = this.Configuration!.get<boolean>(`emulator.${this.Id.toLowerCase()}.autoCloseExistingInstances`,true); 

        // Result
        return true;
    }

    protected async ExecuteEmulatorAsync(): Promise<boolean> {
        console.log('debugger:StellaEmulator.ExecuteEmulatorAsync');

        // Prepare
        application.CompilerOutputChannel.appendLine(''); 

        // Validate inbuilt availability
        //if ((application.IsMacOS) && !this.CustomFolderOrPath) {
        //    application.Notify(`WARNING: You must provide a path to your ${this.Id} emulator before you can launch your game. Review your selection in Review your selection in ${application.PreferencesSettingsExtensionPath}.`); 
        //    return false;
        //}

        // Compiler options
        let command = this.FolderOrPath;
        if (application.IsMacOS) {
            // Append
            command = `open -a "${command}"`;
        }
 
        // Args
        let args = [
            this.Args,
            `"${this.FileName}"`
        ]

        // Kill any existing process
        if (this.AutoCloseExistingInstances) await execute.KillProcessByNameAsync(this.Name);

        // Process
        application.CompilerOutputChannel.appendLine(`Launching ${this.Name} emulator...`);         
        
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FileName),
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

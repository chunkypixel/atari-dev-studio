"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
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
        if (!result) { return false; }
        
        // Emulator
        if (!this.CustomFolderOrPath) {
            // Emulator name (depends on OS)
            var emulatorName = "Stella.exe";
            if (application.IsLinux) {
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
        application.WriteToCompilerTerminal(''); 

        // Validate for 32-bit on macOS
        if (!this.CustomFolderOrPath && (application.IsMacOS && application.Is32Bit)) {
            application.WriteToCompilerTerminal(`ERROR: Unable to launch the Stella emulator as there is no 32-bit version available for macOS.`); 
            return false;  
        }

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Command
        let command = `"${this.FolderOrPath}"`;
        if (application.IsMacOS) { command = `open -a "${command}"`; }

        // Args
        let args = [
            this.Args,
            `"${this.FileName}"`
        ];

        // Kill any existing process
        if (this.AutoCloseExistingInstances) { await execute.KillProcessByNameAsync(this.Name); }

        // Process
        application.WriteToCompilerTerminal(`Launching ${this.Name} emulator...`);         
        
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FileName),
            (stdout: string) => {
                // Prepare
                let result = true;

                // Result
                application.WriteToCompilerTerminal('' + stdout, false);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Result
                application.WriteToCompilerTerminal('' + stderr, false);
                return result;
            });

        // Result
        return executeResult;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:StellaEmulator.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) { return true; }

        // Process
        let result = await filesystem.ChModAsync(this.FolderOrPath);
        // Attempt to mark Stella as execute #19
        if (result && application.IsMacOS) { result = await filesystem.ChModAsync(path.join(this.FolderOrPath,`Contents/MacOS/Stella`)); }

        // Result
        return result;
    }
}

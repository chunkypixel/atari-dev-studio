"use strict";
import * as path from 'path';
import * as application from '../application';
import * as filesystem from '../filesystem';
import * as execute from '../execute';
import { EmulatorBase } from "./emulatorBase";

export class A7800Emulator extends EmulatorBase {
    
    // Features
    public Region: string = "";
    public Console: string = "";
    public Debugger: boolean = false;

    // Lists (to match settings)
    // Hopefully one-day I'll work out how to hot-load into settings
    // so we can dynamically configure
    protected readonly RegionList: Map<string, string> = new Map([
        ["Atari 7800 (NTSC) Cool","a7800u1"], 
        ["Atari 7800 (NTSC) Warm","a7800"],
        ["Atari 7800 (NTSC) Hot","a7800u2"],
        ["Atari 7800 (NTSC) Developer Mode","a7800dev"],
        ["Atari 7800 (PAL) Cool","a7800pu1"],
        ["Atari 7800 (PAL) Warm","a7800p"],
        ["Atari 7800 (PAL) Hot","a7800pu2"],
        ["Atari 7800 (PAL) Developer Mode","a7800pdev"]
    ]);
    protected readonly ConsoleList: Map<string, string> = new Map([
        ["Standard Console",""], 
        ["High Score Cartridge","hiscore"],
        ["XBoarD Expansion","xboard"],
        ["XM Expansion Module","xm"]
    ]);

    constructor() {
        super("A7800","A7800",path.join(application.Path,"out","bin","emulators","a7800"));
    }

    protected async LoadConfigurationAsync() : Promise<boolean> {
        console.log('debugger:A7800Emulator.LoadConfigurationAsync');

        // Base
        let result = await super.LoadConfigurationAsync();
        if (!result) { return false; }

        // Reset
        this.Region = "";
        this.Console = "";
        this.Debugger = false;

        // Emulator
        if (!this.CustomFolderOrPath) {
            if (application.IsWindows) {
                this.FolderOrPath = path.join(this.FolderOrPath,"A7800.exe");
            }
            else if (application.IsLinux || application.IsMacOS) {
                // Prepare
                let architecture = "Linux";
                if (application.IsMacOS) { architecture = "Darwin"; }
            
                // Set
                this.FolderOrPath = path.join(this.FolderOrPath,`a7800.${architecture}`);
            }
        }

        // Emulator (Other)
        let userRegion = this.Configuration!.get<string>(`emulator.${this.Id.toLowerCase()}.region`,""); 
        if (userRegion) {
            // Confirm from list
            for (let [name, id] of this.RegionList) {
                if (name === userRegion) {
                    this.Region = id;
                    break;
                }
            }
        }
        let userConsole = this.Configuration!.get<string>(`emulator.${this.Id.toLowerCase()}.console`,""); 
        if (userConsole) {
            // Confirm from list
            for (let [name, id] of this.ConsoleList) {
                if (name === userConsole) {
                    this.Console = id;
                    break;
                }
            }
        }
        this.Debugger = this.Configuration!.get<boolean>(`emulator.${this.Id.toLowerCase()}.debugger`,false);

        // Result
        return true;
    }

    protected async ExecuteEmulatorAsync(): Promise<boolean> {
        console.log('debugger:A7800Emulator.ExecuteEmulatorAsync');

        // Prepare
        application.CompilerOutputChannel.appendLine(''); 

        // Premissions
        await this.RepairFilePermissionsAsync();

        // Command
        let command = `"${this.FolderOrPath}"`;
        
        // Args
        // Make sure we send nodebug where config is being saved
        let args = [
            `${this.Region} -cart1`,
            (this.Console ? `${this.Console} -cart2` : ""),
            `"${this.FileName}"`,
            (this.Debugger ? `-debug` : "-nodebug"),
            this.Args
        ];

        // NOTE: This may need to be moved before compilation as it appears MAME is holding onto the launched file.
        //       Also need to confirm actual name to search for.
        // Kill any existing process
        await execute.KillProcessByNameAsync(this.Name);

        // Process
        application.WriteToCompilerTerminal(`Launching ${this.Name} emulator...`);         
        
        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FolderOrPath),
            (stdout: string) => {
                // Prepare
                let result = true;

                // Result
                application.WriteToCompilerTerminal(stdout, false);
                return result;
            },
            (stderr: string) => {
                // Prepare
                let result = true;

                // Result
                application.WriteToCompilerTerminal(stderr, false);
                return result;
            });

        // Result
        return executeResult;
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        console.log('debugger:A7800Emulator.RepairFilePermissionsAsync'); 

        // Validate
        if (this.CustomFolderOrPath || application.IsWindows) { return true; }

        // Process
        let result = await filesystem.ChModAsync(this.FolderOrPath);
        return result;
    }
}

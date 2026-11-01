"use strict";
import * as path from 'path';
import * as application from '../application';
import * as configuration from '../configuration';
import * as execute from '../execute';
import { SerialBase } from "./serialBase";

export class SeventyEightHundredGDSerial extends SerialBase {

    constructor() {
        super("7800GD","7800GD",path.join(application.Path,"out","bin","serial","7800gd"));
    }

    protected async ExecuteSerialAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredGDSerial.ExecuteSerialAsync');

        // Prepare
        const config = configuration.GetAtariDevStudioConfiguration(); 
        application.WriteToCompilerTerminal();   
        
        // Load
        var seventyEightHundredGDCmdAppFileName = `7800cmd${application.OSPlatform === "win32" ? ".exe" : ""}`;
        var comPort = config.get<string>(`launch.emulatorOrCartComPort`,"Emulator").toLowerCase();
        let command = `"${path.join(this.FolderOrPath,application.OSPlatform,seventyEightHundredGDCmdAppFileName)}"`;

        // Args
        let args = [
            `-com ${comPort}`,
            `-run "${this.FileName}"`]

        // Process
        application.WriteToCompilerTerminal(`Launching ${this.Name} serial process...`); 

        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FolderOrPath),
            (stdout: string) => {
                // Prepare
                let result = true;

                // Sanitize output
                // need to remove +\b from messages (looks a bit nicer)
                var pattern = /.\*/g;
                stdout = stdout.replace(pattern,"");

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
}

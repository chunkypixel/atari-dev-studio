"use strict";
import * as path from 'path';
import * as application from '../application';
import * as execute from '../execute';
import { SerialBase } from "./serialBase";

export class SeventyEightHundredGDSerial extends SerialBase {

    constructor() {
        super("7800GD","7800GD",path.join(application.Path,"out","bin","serial","7800gd","7800cmd.exe"));
    }

    protected async ExecuteSerialAsync(): Promise<boolean> {
        console.log('debugger:SeventyEightHundredGDSerial.ExecuteSerialAsync');

        // Load
        var configuration = application.GetConfiguration();
        var comPort = configuration.get<string>(`launch.emulatorOrCartComPort`,"Emulator").toLowerCase();

        // Prepare
        application.CompilerOutputChannel.appendLine(''); 
         
        // Command
        let command = `"${this.FolderOrPath}"`;

        // Args
        let args = [
            `-com ${comPort}`,
            `-run "${this.FileName}"`]

        // Process
        application.CompilerOutputChannel.appendLine(`Launching ${this.Name} serial process...`); 

        // Launch
        let executeResult = await execute.Spawn(command, args, null, path.dirname(this.FolderOrPath),
            (stdout: string) => {
                // Prepare
                let result = true;

                // Sanitize output
                // need to remove +\b from mesages (looks a bit nicer)
                var pattern = /[+][\b]+/gi;
                stdout = stdout.replace(pattern,"");

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

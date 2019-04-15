"use strict";
import { Writable } from 'stream';
const cp = require("child_process");

export function ExecuteCommand(output: Writable, command:string, args:string[], env: { [key: string]: string | null }, cwd: string) : Promise<boolean> {
    console.log('debugger:execute.ExecuteCommand');

    // Process
    return new Promise((resolve, reject) => {
        // prepare
        let receivedError = false;

        // Spawn compiler
        let ca = cp.spawn(command, args, {
            shell: true, 
            env: env,
            cwd: cwd
        });

        output.addListener('pipe',ca);
       
        // TODO: need to break out these out to parent class so we don't list all compilers here

        // Capture output
        ca.stdout.on('data', (data: { toString: () => ""; }) => {
            // Prepare
            let message = data.toString();

            console.log('- stdout ');
            console.log(message);
        });
        ca.stderr.on('data', (data: { toString: () => ""; }) => {
            // Prepare
            let message = data.toString();

            console.log('- stderr ');
            console.log(message);
        });

        // Error?
        ca.on('error', (err: any) => {
            console.log(`- error '${err}'`);
            output.removeAllListeners();
            return resolve(false);
        });

        // Complete
        ca.on("close", (e: any) => {
            // Validate
            let result = e;
            if (receivedError && result === 0) { result = 1; }
            
            output.removeAllListeners();

            // Finalise and exit
            return resolve(result === 0);
        });

    });
}
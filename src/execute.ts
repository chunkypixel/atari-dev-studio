"use strict";
const cp = require("child_process");

export function Spawn(command:string, args:string[] | null, env: { [key: string]: string | null } | null, cwd: string, stdout:any, stderr:any) : Promise<boolean> {
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
        
        // Capture output
        ca.stdout.on('data', (data: { toString: () => ""; }) => {
            // Prepare
            let message = data.toString();
            
            // Send out
            var result = stdout(message);
            if (!result) receivedError = true;

            // Notify
            console.log('- stdout ');
            console.log(message);
        });
        ca.stderr.on('data', (data: { toString: () => ""; }) => {
            // Prepare
            let message = data.toString();

            // Send out
            var result = stderr(message);
            if (!result) receivedError = true;

            // Notify
            console.log('- stderr ');
            console.log(message);
        });

        // Error?
        ca.on('error', (err: any) => {
            console.log(`- error '${err}'`);
            return resolve(false);
        });

        // Complete
        ca.on("close", (e: any) => {
            // Validate
            let result = e;
            if (receivedError && result === 0) { result = 1; }

            // Finalise and exit
            return resolve(result === 0);
        });

    });
}
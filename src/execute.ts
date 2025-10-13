"use strict";
import * as application from './application';
import find = require("find-process");
const cp = require("child_process");


export async function KillProcessByNameAsync(name:string): Promise<void> {
    // Need to lowercase name
    if (application.IsLinux || application.IsMacOS) { name = name.toLowerCase(); }

    // Search
    await find('name', name)
        .then(function (list:any) {
            console.log(list);
            for (let process of list) {
                KillProcessById(process?.id);
            }	
        }, function (err:any) {
            console.log(err.stack || err);
        });
}

export function KillProcessById(pid:any): void {
    // Validate
    if (pid === undefined) { return; }

    // Process
    try {
        process.kill(pid,"SIGKILL"); // force
        console.log(`Process ${pid} terminated.`);  
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Failed to kill process ${pid}`); 
        } else {
            console.log(`Unknow error occurred while killing process ${pid}`);            
        } 
    }
}

export function KillSpawnProcess(): void {
    // Process
    KillProcessById(cp?._process?.id);
}

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
            if (!result) { receivedError = true; }

            // Notify
            console.log('- stdout ');
            console.log(message);
        });
        ca.stderr.on('data', (data: { toString: () => ""; }) => {
            // Prepare
            let message = data.toString();

            // Send out
            var result = stderr(message);
            if (!result) { receivedError = true; }

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

            // Exit code?
            if (result !== 0) { stdout(`Exit code: ${result}`); }

            // Finalise and exit
            return resolve(result === 0);
        });

    });
    
}
"use strict";
import * as application from './application';
import findProcess = require('find-process');
import { spawn, ChildProcess } from 'child_process';

let lastSpawnedProcess: ChildProcess | null = null;

export async function KillProcessByNameAsync(name: string): Promise<void> {
    // Normalize name on POSIX
    const searchName = (application.IsLinux || application.IsMacOS) ? name.toLowerCase() : name;

    try {
        const list: Array<{ pid?: number | string }> = await findProcess('name', searchName);
        for (const proc of list) {
            if (proc?.pid !== undefined) {
                KillProcessById(proc.pid);
            }
        }
    } catch (err: unknown) {
        console.log('KillProcessByNameAsync failed', err);
    }
}

export function KillProcessById(pid: number | string | undefined): void {
    if (pid === undefined || pid === null) return;

    try {
        // Ensure number
        const numericPid = typeof pid === 'string' ? Number(pid) : pid;
        if (Number.isNaN(numericPid)) return;

        // Best-effort kill
        process.kill(numericPid, 'SIGKILL');
        console.log(`Process ${numericPid} terminated.`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Failed to kill process ${pid}: ${error.message}`);
        } else {
            console.log(`Unknown error occurred while killing process ${pid}`);
        }
    }
}

export function KillSpawnProcess(): void {
    if (lastSpawnedProcess && typeof lastSpawnedProcess.pid === 'number') {
        KillProcessById(lastSpawnedProcess.pid);
    }
}

export function Spawn(
    command: string,
    args?: string[] | null,
    env?: NodeJS.ProcessEnv | null,
    cwd?: string,
    stdout?: (msg: string) => boolean,
    stderr?: (msg: string) => boolean
): Promise<boolean> {
    console.log('debugger:execute.ExecuteCommand');

    return new Promise((resolve) => {
        let receivedError = false;

        const child = spawn(command, args ?? [], {
            shell: true,
            env: env ?? process.env,
            cwd: cwd ?? process.cwd()
        });

        // keep reference for external kill
        lastSpawnedProcess = child;

        if (child.stdout) {
            child.stdout.on('data', (data: Buffer | string) => {
                const message = data.toString();
                try {
                    if (stdout) {
                        const ok = stdout(message);
                        if (!ok) receivedError = true;

                        // Notify
                        console.log('- stdout ');
                        console.log(message);   
                    }
                } catch {
                    receivedError = true;
                }
            });
        }

        if (child.stderr) {
            child.stderr.on('data', (data: Buffer | string) => {
                const message = data.toString();
                try {
                    if (stderr) {
                        const ok = stderr(message);
                        if (!ok) receivedError = true;

                        // Notify
                        console.log('- stderr ');
                        console.log(message);
                    } else {
                        // default to marking as error if no handler provided
                        receivedError = true;
                    }
                } catch {
                    receivedError = true;
                }
            });
        }

        child.on('error', (err: unknown) => {
            console.log('- spawn error', err);
            resolve(false);
        });

        child.on('close', (code: number | null) => {
            // clear reference
            lastSpawnedProcess = null;

            const exitCode = code ?? 1;
            const finalCode = (receivedError && exitCode === 0) ? 1 : exitCode;

            if (finalCode !== 0 && stdout) {
                try { stdout(`Exit code: ${finalCode}`); } catch {}
            }

            resolve(finalCode === 0);
        });
    });
}
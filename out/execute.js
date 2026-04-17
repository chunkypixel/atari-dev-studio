"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KillProcessByNameAsync = KillProcessByNameAsync;
exports.KillProcessById = KillProcessById;
exports.KillSpawnProcess = KillSpawnProcess;
exports.Spawn = Spawn;
const application = __importStar(require("./application"));
const findProcess = require("find-process");
const child_process_1 = require("child_process");
let lastSpawnedProcess = null;
async function KillProcessByNameAsync(name) {
    // Normalize name on POSIX
    const searchName = (application.IsLinux || application.IsMacOS) ? name.toLowerCase() : name;
    try {
        const list = await findProcess('name', searchName);
        for (const proc of list) {
            if (proc?.pid !== undefined) {
                KillProcessById(proc.pid);
            }
        }
    }
    catch (err) {
        console.log('KillProcessByNameAsync failed', err);
    }
}
function KillProcessById(pid) {
    if (pid === undefined || pid === null)
        return;
    try {
        // Ensure number
        const numericPid = typeof pid === 'string' ? Number(pid) : pid;
        if (Number.isNaN(numericPid))
            return;
        // Best-effort kill
        process.kill(numericPid, 'SIGKILL');
        console.log(`Process ${numericPid} terminated.`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(`Failed to kill process ${pid}: ${error.message}`);
        }
        else {
            console.log(`Unknown error occurred while killing process ${pid}`);
        }
    }
}
function KillSpawnProcess() {
    if (lastSpawnedProcess && typeof lastSpawnedProcess.pid === 'number') {
        KillProcessById(lastSpawnedProcess.pid);
    }
}
function Spawn(command, args, env, cwd, stdout, stderr) {
    console.log('debugger:execute.ExecuteCommand');
    return new Promise((resolve) => {
        let receivedError = false;
        const child = (0, child_process_1.spawn)(command, args ?? [], {
            shell: true,
            env: env ?? process.env,
            cwd: cwd ?? process.cwd()
        });
        // keep reference for external kill
        lastSpawnedProcess = child;
        if (child.stdout) {
            child.stdout.on('data', (data) => {
                const message = data.toString();
                try {
                    if (stdout) {
                        const ok = stdout(message);
                        if (!ok)
                            receivedError = true;
                        // Notify
                        console.log('- stdout ');
                        console.log(message);
                    }
                }
                catch {
                    receivedError = true;
                }
            });
        }
        if (child.stderr) {
            child.stderr.on('data', (data) => {
                const message = data.toString();
                try {
                    if (stderr) {
                        const ok = stderr(message);
                        if (!ok)
                            receivedError = true;
                        // Notify
                        console.log('- stderr ');
                        console.log(message);
                    }
                    else {
                        // default to marking as error if no handler provided
                        receivedError = true;
                    }
                }
                catch {
                    receivedError = true;
                }
            });
        }
        child.on('error', (err) => {
            console.log('- spawn error', err);
            resolve(false);
        });
        child.on('close', (code) => {
            // clear reference
            lastSpawnedProcess = null;
            const exitCode = code ?? 1;
            const finalCode = (receivedError && exitCode === 0) ? 1 : exitCode;
            if (finalCode !== 0 && stdout) {
                try {
                    stdout(`Exit code: ${finalCode}`);
                }
                catch { }
            }
            resolve(finalCode === 0);
        });
    });
}
//# sourceMappingURL=execute.js.map
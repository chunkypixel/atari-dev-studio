"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KillProcessByNameAsync = KillProcessByNameAsync;
exports.KillProcessById = KillProcessById;
exports.KillSpawnProcess = KillSpawnProcess;
exports.Spawn = Spawn;
const application = require("./application");
const findProcess = require("find-process");
const child_process_1 = require("child_process");
let lastSpawnedProcess = null;
function KillProcessByNameAsync(name) {
    return __awaiter(this, void 0, void 0, function* () {
        // Normalize name on POSIX
        const searchName = (application.IsLinux || application.IsMacOS) ? name.toLowerCase() : name;
        try {
            const list = yield findProcess('name', searchName);
            for (const proc of list) {
                if ((proc === null || proc === void 0 ? void 0 : proc.pid) !== undefined) {
                    KillProcessById(proc.pid);
                }
            }
        }
        catch (err) {
            console.log('KillProcessByNameAsync failed', err);
        }
    });
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
        const child = (0, child_process_1.spawn)(command, args !== null && args !== void 0 ? args : [], {
            shell: true,
            env: env !== null && env !== void 0 ? env : process.env,
            cwd: cwd !== null && cwd !== void 0 ? cwd : process.cwd()
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
                catch (_a) {
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
                catch (_a) {
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
            const exitCode = code !== null && code !== void 0 ? code : 1;
            const finalCode = (receivedError && exitCode === 0) ? 1 : exitCode;
            if (finalCode !== 0 && stdout) {
                try {
                    stdout(`Exit code: ${finalCode}`);
                }
                catch (_a) { }
            }
            resolve(finalCode === 0);
        });
    });
}
//# sourceMappingURL=execute.js.map
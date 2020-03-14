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
const application = require("./application");
const process_1 = require("process");
const cp = require("child_process");
const find = require("find-process");
function KillProcessByNameAsync(name) {
    return __awaiter(this, void 0, void 0, function* () {
        // Need to lowercase name
        if (application.IsLinux || application.IsMacOS) {
            name = name.toLowerCase();
        }
        // Search
        yield find('name', name)
            .then(function (list) {
            console.log(list);
            for (let process of list) {
                try {
                    process_1.kill(process.pid);
                }
                catch (error) {
                    console.log(`Failed to kill process ${process.pid}: ${process.name}`);
                }
            }
        }, function (err) {
            console.log(err.stack || err);
        });
    });
}
exports.KillProcessByNameAsync = KillProcessByNameAsync;
function KillSpawnProcess() {
    // Process
    try {
        // Try and kill any child process
        let kill = require('tree-kill');
        kill(cp._process.id);
    }
    finally { }
}
exports.KillSpawnProcess = KillSpawnProcess;
function Spawn(command, args, env, cwd, stdout, stderr) {
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
        ca.stdout.on('data', (data) => {
            // Prepare
            let message = data.toString();
            // Send out
            var result = stdout(message);
            if (!result) {
                receivedError = true;
            }
            // Notify
            console.log('- stdout ');
            console.log(message);
        });
        ca.stderr.on('data', (data) => {
            // Prepare
            let message = data.toString();
            // Send out
            var result = stderr(message);
            if (!result) {
                receivedError = true;
            }
            // Notify
            console.log('- stderr ');
            console.log(message);
        });
        // Error?
        ca.on('error', (err) => {
            console.log(`- error '${err}'`);
            return resolve(false);
        });
        // Complete
        ca.on("close", (e) => {
            // Validate
            let result = e;
            if (receivedError && result === 0) {
                result = 1;
            }
            // Finalise and exit
            return resolve(result === 0);
        });
    });
}
exports.Spawn = Spawn;
//# sourceMappingURL=execute.js.map
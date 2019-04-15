"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
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
        // TODO: need to break out these out to parent class so we don't list all compilers here
        // Capture output
        ca.stdout.on('data', (data) => {
            // Prepare
            let message = data.toString();
            // Send out
            var result = stdout(message);
            if (!result)
                receivedError = true;
            // Notify
            console.log('- stdout ');
            console.log(message);
        });
        ca.stderr.on('data', (data) => {
            // Prepare
            let message = data.toString();
            // Send out
            var result = stderr(message);
            if (!result)
                receivedError = true;
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
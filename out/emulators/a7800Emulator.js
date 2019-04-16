"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const application = require("../application");
const emulatorBase_1 = require("./emulatorBase");
class A7800Emulator extends emulatorBase_1.EmulatorBase {
    constructor() {
        super("a7800", "A7800", path.join(application.Path, "out", "bin", "emulators", "a7800"));
    }
}
exports.A7800Emulator = A7800Emulator;
//# sourceMappingURL=a7800Emulator.js.map
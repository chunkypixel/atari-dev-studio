"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const application = require("../application");
const emulatorBase_1 = require("./emulatorBase");
class StellaEmulator extends emulatorBase_1.EmulatorBase {
    constructor() {
        super("stella", "Stella", path.join(application.Path, "out", "bin", "emulators", "stella"));
    }
}
exports.StellaEmulator = StellaEmulator;
//# sourceMappingURL=stellaEmulator.js.map
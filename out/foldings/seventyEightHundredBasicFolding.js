"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeventyEightHundredBasicFolding = void 0;
const foldingBase_1 = require("./foldingBase");
class SeventyEightHundredBasicFolding extends foldingBase_1.FoldingBase {
    constructor() {
        super("7800basic", ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
exports.SeventyEightHundredBasicFolding = SeventyEightHundredBasicFolding;
//# sourceMappingURL=seventyEightHundredBasicFolding.js.map
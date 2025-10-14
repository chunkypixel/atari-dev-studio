"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeventyEightHundredBasicFolding = void 0;
const application = require("../application");
const foldingBase_1 = require("./foldingBase");
class SeventyEightHundredBasicFolding extends foldingBase_1.FoldingBase {
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId, ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
exports.SeventyEightHundredBasicFolding = SeventyEightHundredBasicFolding;
//# sourceMappingURL=seventyEightHundredBasicFolding.js.map
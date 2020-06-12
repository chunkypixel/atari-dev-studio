"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatariBasicFolding = void 0;
const foldingBase_1 = require("./foldingBase");
class BatariBasicFolding extends foldingBase_1.FoldingBase {
    constructor() {
        super("batariBasic", ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
exports.BatariBasicFolding = BatariBasicFolding;
//# sourceMappingURL=batariBasicFolding.js.map
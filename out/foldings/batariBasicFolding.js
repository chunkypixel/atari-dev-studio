"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatariBasicFolding = void 0;
const application = require("../application");
const foldingBase_1 = require("./foldingBase");
class BatariBasicFolding extends foldingBase_1.FoldingBase {
    constructor() {
        super(application.BatariBasicLanguageId, ";[\\s]*#region[\\s]*(.*)", ";[\\s]*#endregion");
    }
}
exports.BatariBasicFolding = BatariBasicFolding;
//# sourceMappingURL=batariBasicFolding.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatariBasicDefinitionProvider = void 0;
const application = require("../application");
const definitionProviderBase_1 = require("./definitionProviderBase");
class BatariBasicDefinitionProvider extends definitionProviderBase_1.DefinitionProviderBase {
    constructor() {
        super(application.BatariBasicLanguageId);
    }
}
exports.BatariBasicDefinitionProvider = BatariBasicDefinitionProvider;
//# sourceMappingURL=batariBasicDefinitionProvider.js.map
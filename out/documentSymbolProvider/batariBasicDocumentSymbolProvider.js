"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatariBasicDocumentSymbolProvider = void 0;
const application = require("../application");
const documentSymbolProviderBase_1 = require("./documentSymbolProviderBase");
class BatariBasicDocumentSymbolProvider extends documentSymbolProviderBase_1.DocumentSymbolProviderBase {
    constructor() {
        super(application.BatariBasicLanguageId);
    }
}
exports.BatariBasicDocumentSymbolProvider = BatariBasicDocumentSymbolProvider;
//# sourceMappingURL=batariBasicDocumentSymbolProvider.js.map
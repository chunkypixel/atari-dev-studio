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
exports.BatariBasicContextHelp = void 0;
const contextHelpBase_1 = require("./contextHelpBase");
class BatariBasicContextHelp extends contextHelpBase_1.ContextHelpBase {
    constructor() {
        super("batariBasic", "https://randomterrain.com/atari-2600-memories-batari-basic-commands.html");
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Files
            yield this.LoadContextHelpFileAsync(context, 'batariBasic.md'); // batariBasic keywords
        });
    }
}
exports.BatariBasicContextHelp = BatariBasicContextHelp;
//# sourceMappingURL=batariBasicContextHelp.js.map
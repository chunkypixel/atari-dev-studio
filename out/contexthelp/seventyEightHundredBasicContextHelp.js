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
exports.SeventyEightHundredBasicContextHelp = void 0;
const application = require("../application");
const contextHelpBase_1 = require("./contextHelpBase");
class SeventyEightHundredBasicContextHelp extends contextHelpBase_1.ContextHelpBase {
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId, "https://randomterrain.com/7800basic.html");
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // Files
            yield this.LoadContextHelpFileAsync(context, '7800basic.md'); // 7800basic keywords
        });
    }
}
exports.SeventyEightHundredBasicContextHelp = SeventyEightHundredBasicContextHelp;
//# sourceMappingURL=seventyEightHundredBasicContextHelp.js.map
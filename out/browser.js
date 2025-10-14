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
exports.OpenUrlInBrowser = OpenUrlInBrowser;
const vscode = require("vscode");
const open_1 = require("open");
function OpenUrlInBrowser(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('debugger:Browser.OpenUrlInBrowser');
        try {
            yield (0, open_1.default)(url);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to open Web Browser. Please check if you have Chrome, Firefox or Edge correctly installed!`);
        }
    });
}
//# sourceMappingURL=browser.js.map
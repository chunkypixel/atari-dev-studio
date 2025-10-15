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
exports.GenerateNonce = GenerateNonce;
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
function GenerateNonce() {
    const array = new Uint8Array(16); // 16 bytes for a secure nonce
    crypto.getRandomValues(array); // Use Web Crypto API
    // Convert to base64, removing padding and non-alphanumeric characters
    const base64 = Buffer.from(array).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return base64;
}
//# sourceMappingURL=browser.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenUrlInBrowser = OpenUrlInBrowser;
exports.GenerateNonce = GenerateNonce;
const vscode = __importStar(require("vscode"));
const open_1 = __importDefault(require("open"));
async function OpenUrlInBrowser(url) {
    console.log('debugger:Browser.OpenUrlInBrowser');
    try {
        await (0, open_1.default)(url);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to open Web Browser. Please check if you have Chrome, Firefox or Edge correctly installed!`);
    }
}
function GenerateNonce() {
    const array = new Uint8Array(16); // 16 bytes for a secure nonce
    crypto.getRandomValues(array); // Use Web Crypto API
    // Convert to base64, removing padding and non-alphanumeric characters
    const base64 = Buffer.from(array).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return base64;
}

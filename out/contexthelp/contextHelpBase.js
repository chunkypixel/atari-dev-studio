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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextHelpBase = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const browser = __importStar(require("../browser"));
const filesystem = __importStar(require("../filesystem"));
class ContextHelpBase {
    Id;
    Url;
    links = {};
    constructor(id, url) {
        this.Id = id;
        this.Url = url;
    }
    async LoadContextHelpFileAsync(context, filename) {
        // Prepare
        const filePath = vscode.Uri.file(path.join(context.extensionPath, 'contexthelp', filename));
        // Process
        const fileArrary = (await filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).split(/\r?\n/);
        for (const line of fileArrary) {
            // split (into 2) and validate length
            var content = line.split("|");
            if (content.length != 2)
                continue;
            // store?
            this.links[content[0].toLowerCase()] = content[1].toLowerCase();
        }
    }
    async OpenContextHelpAtCursorAsync(document, position) {
        // validate if a range is selected
        let wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange)
            return undefined;
        // get selected word
        let word = document.getText(wordRange);
        if (!word)
            return undefined;
        // Find a match
        var content = this.links[word.toLowerCase()];
        if (content) {
            // Yes got one
            var url = this.Url + '#' + content;
            await browser.OpenUrlInBrowser(url);
        }
    }
}
exports.ContextHelpBase = ContextHelpBase;

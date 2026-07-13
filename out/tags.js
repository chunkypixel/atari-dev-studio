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
exports.ScanDocumentForADSLanguageTag = ScanDocumentForADSLanguageTag;
exports.ScanDocumentForADSCompilerTag = ScanDocumentForADSCompilerTag;
const vscode = __importStar(require("vscode"));
const application = __importStar(require("./application"));
const configuration = __importStar(require("./configuration"));
const filesystem = __importStar(require("./filesystem"));
function ScanDocumentForADSLanguageTag(document) {
    // prepare
    const text = document.getText();
    // scan
    const match = text.match(/#ADSLanguage=([^;\n\r]*)/);
    if (match && match[1]) {
        // found the tags
        const languageToken = match[1].toLowerCase();
        vscode.languages.getLanguages().then((languages) => {
            // search for wanted language
            const matchingLanguage = languages.find((language) => language.toLowerCase() === languageToken.toLowerCase());
            // is the language available?
            if (matchingLanguage) {
                // yes!
                vscode.languages.setTextDocumentLanguage(document, matchingLanguage);
                return;
            }
            ;
        });
    }
    ;
    // Is in the samples folder and a language document? if so determine which language to use
    const fileName = document.fileName.toLowerCase();
    const fileExtension = filesystem.GetFileExtension(document.uri).toLowerCase();
    if (fileName.includes("samples") && fileExtension == ".bas") {
        // Prepare
        let matchingLanguage = '';
        // Validate
        if (fileName.includes(application.SeventyEightHundredBasicLanguageId)) {
            matchingLanguage = application.SeventyEightHundredBasicLanguageId;
        }
        else if (fileName.includes(application.BatariBasicLanguageId)) {
            matchingLanguage = application.BatariBasicLanguageId;
        }
        // is the language available?        
        if (matchingLanguage) {
            // yes!
            vscode.languages.setTextDocumentLanguage(document, matchingLanguage);
            return;
        }
    }
    // if tag or language not found let the system choose
}
function ScanDocumentForADSCompilerTag(languageId, document) {
    // prepare
    const text = document.getText();
    let compiler = '';
    // language
    let compilerTagMatch = text.match(/#ADSCompiler=([^;\n\r]*)/);
    if (compilerTagMatch && compilerTagMatch[1]) {
        // is valid?
        const customCompiler = compilerTagMatch[1];
        switch (customCompiler.toLowerCase()) {
            case "default":
            case "make":
                // set
                compiler = customCompiler;
                break;
            default:
                // others = lets check the language list
                const customCompilerIdList = configuration.GetCustomCompilerIdList(languageId);
                const firstCompilerId = customCompilerIdList[0] ?? '';
                // find match
                customCompilerIdList.forEach((item) => {
                    // validate
                    const id = item;
                    if (!compiler && id.toLowerCase() === customCompiler.toLowerCase())
                        compiler = id;
                });
                // no match to our list? if custom send back the first entry instead (if one exists)
                if (!compiler && customCompiler.toLowerCase() === "custom" && firstCompilerId) {
                    compiler = firstCompilerId;
                    break;
                }
                // exit (just return back what user has set)
                compiler = customCompiler;
                break;
        }
        ;
    }
    ;
    // return result
    return compiler;
}

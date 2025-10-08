"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanDocumentForADSDefinitions = ScanDocumentForADSDefinitions;
const vscode = require("vscode");
const languageTagPattern = /;#ADSLanguageTag:(\w+)/;
function ScanDocumentForADSDefinitions(document) {
    // prepare
    const text = document.getText();
    // language
    let languageTagMatch = text.match(languageTagPattern);
    if (languageTagMatch && languageTagMatch[1]) {
        // prepare
        let languageToken = languageTagMatch[1];
        // scan
        vscode.languages.getLanguages().then((languages => {
            // do we have the language available?
            if (languages.includes(languageToken))
                // yes! set
                vscode.languages.setTextDocumentLanguage(document, languageToken);
        }));
        // if language not found let the sysytem choose
    }
    ;
}
//# sourceMappingURL=definition.js.map
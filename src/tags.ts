"use strict";
import * as vscode from 'vscode';

const compilerTokenPattern = /;#ADSCompiler:(\w+)/;

export function ScanDocumentForADSLanguageTag(document: vscode.TextDocument) {
    // prepare
    const text = document.getText();

    // scan
    let match = text.match(/;#ADSLanguage:(\w+)/i);
    if (match && match[1]) {
        // found the tags
        const languageToken = match[1].toLowerCase();
        vscode.languages.getLanguages().then((languages) => {
            // search for wanted language
            const matchingLanguage = languages.find((lang) => 
                lang.toLowerCase() === languageToken.toLowerCase()
            );

            // is the language available?
            if (matchingLanguage) {
                // yes!
                vscode.languages.setTextDocumentLanguage(document, matchingLanguage);
            };
        });
    };

    // if tag or language not found let the sysytem choose
}

export function ScanDocumentForADSCompilerTag(document: vscode.TextDocument): string {
    // prepare
    const text = document.getText();
    let compiler = '';

    // language
    let compilerTagMatch = text.match(/;#ADSCompiler:(\w+)/i);
    if (compilerTagMatch && compilerTagMatch[1]) {
        // is valid?
        // NOTE: for now lets make sure it's valid
        const languageCompiler = compilerTagMatch[1].toLowerCase();
        switch (languageCompiler)
        {
            case "default":
            case "custom":
            case "make":
                // set
                compiler = languageCompiler;
                break;
        }
    };

    // return nothing
    return compiler;
}
"use strict";
import * as vscode from 'vscode';
import * as configuration from './configuration';

export function ScanDocumentForADSLanguageTag(document: vscode.TextDocument) {
    // prepare
    const text = document.getText();

    // scan
    const match = text.match(/#ADSLanguage=([^;\n\r]*)/);
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

export function ScanDocumentForADSCompilerTag(languageId: string, document: vscode.TextDocument): string {
    // prepare
    const text = document.getText();
    let compiler = '';

    // language
    let compilerTagMatch = text.match(/#ADSCompiler=([^;\n\r]*)/);
    if (compilerTagMatch && compilerTagMatch[1]) {
        // is valid?
        const customCompiler = compilerTagMatch[1];
        switch (customCompiler.toLowerCase())
        {
            case "default":
            case "make":
                // set
                compiler = customCompiler;
                break;
            
            default:
                // others = lets check the language list
                const customCompilerIdList =  configuration.GetCustomCompilerIdList(languageId);
                const firstCompilerId = customCompilerIdList[0] ?? '';

                // find match
                customCompilerIdList.forEach((item) => {
                    // validate
                    const id = item;
                    if (!compiler && id.toLowerCase() === customCompiler.toLowerCase()) compiler = id;
                });

                // no match to our list? if custom send back the first entry instead (if one exists)
                if (!compiler && customCompiler.toLowerCase() === "custom" && firstCompilerId) {
                    compiler = firstCompilerId;
                    break;        
                } 

                // exit (just return back what user has set)
                compiler = customCompiler;
                break;
        };
    };

    // return result
    return compiler;
}
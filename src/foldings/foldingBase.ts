"use strict";
import * as vscode from 'vscode';

export interface IRegionPattern {
    startRegEx: string;
    endRegEx: string;
}

export abstract class FoldingBase {

    public readonly Id:string;
    public RegionPattern:IRegionPattern;

    constructor(id:string, regionStartRegEx:string, regionEndRegEx:string) {
        this.Id = id;
        this.RegionPattern = { startRegEx: regionStartRegEx, endRegEx: regionEndRegEx };
    }

    public async RegisterAsync(context: vscode.ExtensionContext): Promise<void> {

        var startRegionPattern: string = this.RegionPattern.startRegEx;
        var endRegionPattern: string = this.RegionPattern.endRegEx;

        let foldingRangeProvider = vscode.languages.registerFoldingRangeProvider(
            this.Id,
            {
                // return ranges
                provideFoldingRanges(document: vscode.TextDocument) {
                    var startedRegions: {
                        lineStart: number;
                        lineEnd?: number;
                        name: string;
                    }[] = [];
                    var completedRegions: vscode.FoldingRange[] = [];
                    var text = document.getText();
                    var lines = text.split("\n");
           
                    var start = new RegExp(startRegionPattern,"i");
                    var end = new RegExp(endRegionPattern,"i");  

                    for (let index = 0; index < lines.length; index++) {
                        var line = lines[index];
                    
                        if (start.exec(line)) {
                            var match = <RegExpMatchArray>line.match(startRegionPattern);
                            var name = match.length > 1 ? match[1] : "";

                            startedRegions.push({
                                lineStart: index,
                                name: name
                            });

                        } else if (end.exec(line)) {
                            if (startedRegions.length === 0) {
                                continue;
                            }

                            var lastStartedRegion = startedRegions[startedRegions.length - 1];
                            lastStartedRegion.lineEnd = index;
                            var foldingRange = new vscode.FoldingRange(
                                lastStartedRegion.lineStart,
                                index,
                                vscode.FoldingRangeKind.Region
                            );

                            completedRegions.push(foldingRange);
                            startedRegions.pop();
                        }
                    }
                    
                    return completedRegions;
                }
            }
        );

    }

}
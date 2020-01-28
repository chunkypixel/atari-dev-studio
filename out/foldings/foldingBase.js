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
const vscode = require("vscode");
class FoldingBase {
    constructor(id, regionStartRegEx, regionEndRegEx) {
        this.Id = id;
        this.RegionPattern = { startRegEx: regionStartRegEx, endRegEx: regionEndRegEx };
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            var startRegionPattern = this.RegionPattern.startRegEx;
            var endRegionPattern = this.RegionPattern.endRegEx;
            let foldingRangeProvider = vscode.languages.registerFoldingRangeProvider(this.Id, {
                // return ranges
                provideFoldingRanges(document) {
                    var startedRegions = [];
                    var completedRegions = [];
                    var text = document.getText();
                    var lines = text.split("\n");
                    var start = new RegExp(startRegionPattern, "i");
                    var end = new RegExp(endRegionPattern, "i");
                    for (let index = 0; index < lines.length; index++) {
                        var line = lines[index];
                        if (start.exec(line)) {
                            var match = line.match(startRegionPattern);
                            var name = match.length > 1 ? match[1] : "";
                            startedRegions.push({
                                lineStart: index,
                                name: name
                            });
                        }
                        else if (end.exec(line)) {
                            if (startedRegions.length === 0) {
                                continue;
                            }
                            var lastStartedRegion = startedRegions[startedRegions.length - 1];
                            lastStartedRegion.lineEnd = index;
                            var foldingRange = new vscode.FoldingRange(lastStartedRegion.lineStart, index, vscode.FoldingRangeKind.Region);
                            completedRegions.push(foldingRange);
                            startedRegions.pop();
                        }
                    }
                    return completedRegions;
                }
            });
        });
    }
}
exports.FoldingBase = FoldingBase;
//# sourceMappingURL=foldingBase.js.map
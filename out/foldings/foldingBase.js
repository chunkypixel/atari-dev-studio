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
exports.FoldingBase = void 0;
const vscode = __importStar(require("vscode"));
class FoldingBase {
    constructor(id, regionStartRegEx, regionEndRegEx) {
        this.Id = id;
        this.RegionPattern = { startRegEx: regionStartRegEx, endRegEx: regionEndRegEx };
    }
    async RegisterAsync(context) {
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
    }
}
exports.FoldingBase = FoldingBase;
//# sourceMappingURL=foldingBase.js.map
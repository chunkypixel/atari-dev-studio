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
exports.SeventyEightHundredBasicHover = void 0;
const application = __importStar(require("../application"));
const hoverBase_1 = require("./hoverBase");
class SeventyEightHundredBasicHover extends hoverBase_1.HoverBase {
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId);
    }
    async RegisterAsync(context) {
        // Files
        await this.LoadHoverFileAsync(context, '7800basic.md'); // 7800basic keywords
        await this.LoadHoverFileAsync(context, '6502.md'); // 6502 opcodes
        await this.LoadHoverFileAsync(context, 'vcs.md'); // Stella & RIOT
        // Finalise
        await super.RegisterAsync(context);
    }
}
exports.SeventyEightHundredBasicHover = SeventyEightHundredBasicHover;

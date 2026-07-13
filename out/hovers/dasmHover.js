"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DasmHover = void 0;
const hoverBase_1 = require("./hoverBase");
class DasmHover extends hoverBase_1.HoverBase {
    constructor() {
        super("dasm");
    }
    async RegisterAsync(context) {
        // Files
        await this.LoadHoverFileAsync(context, '6502.md'); // 6502 opcodes
        await this.LoadHoverFileAsync(context, 'vcs.md'); // Stella & RIOT
        // Finalise
        await super.RegisterAsync(context);
    }
}
exports.DasmHover = DasmHover;

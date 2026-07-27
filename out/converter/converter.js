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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const UPNG = __importStar(require("upng-custom"));
/**
 * Scans a folder for PNGs, decodes them, and re-encodes them into an output folder.
 * @param inputDir Directory containing source PNG files.
 * @param outputDir Directory where processed PNGs will be saved.
 */
async function processPngFolder(inputDir, outputDir) {
    try {
        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });
        // Read all files in the input directory
        const files = await fs.readdir(inputDir);
        const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
        if (pngFiles.length === 0) {
            console.log('No PNG files found in the directory.');
            return;
        }
        for (const file of pngFiles) {
            const inputPath = path.join(inputDir, file);
            const outputPath = path.join(outputDir, `processed_${file}`);
            console.log(`Processing: ${file}...`);
            // 1. Read file into a Node Buffer and convert to ArrayBuffer
            const fileBuffer = await fs.readFile(inputPath);
            const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
            // 2. Decode the PNG using UPNG
            const decodedImg = UPNG.decode(arrayBuffer);
            // 3. Convert decoded frames to standard RGBA8 format
            const rgbaFrames = UPNG.toRGBA8(decodedImg);
            // 4. Re-encode the image (cnum: 0 means lossless / no color reduction)
            const encodedArrayBuffer = UPNG.encode(rgbaFrames, decodedImg.width, decodedImg.height, 0);
            // 5. Convert ArrayBuffer back to Node Buffer and save
            const outputBuffer = Buffer.from(encodedArrayBuffer);
            await fs.writeFile(outputPath, outputBuffer);
            console.log(`Saved: ${outputPath}`);
        }
        console.log('All files processed successfully.');
    }
    catch (error) {
        console.error('An error occurred during processing:', error);
    }
}

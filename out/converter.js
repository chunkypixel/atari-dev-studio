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
exports.PromptUserToProcessPngsInFolder = PromptUserToProcessPngsInFolder;
exports.processAndOverwritePngFolder = processAndOverwritePngFolder;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const UPNG = __importStar(require("./converter/vendor/UPNG.js"));
async function PromptUserToProcessPngsInFolder(uri) {
    // Safety Check: Ensure a valid URI path was captured from the tree click
    if (!uri || !uri.fsPath) {
        vscode.window.showErrorMessage("Could not resolve the selected folder target.");
        return false;
    }
    const folderPath = uri.fsPath;
    try {
        // 1. Fail-Fast Check: Read directory and inspect filenames immediately
        const files = await fs.readdir(folderPath);
        const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
        const pngCount = pngFiles.length;
        if (pngCount == 0) {
            // Instantly exit and alert the user with a standard notification toast
            vscode.window.showInformationMessage(`Operation cancelled: No .png files found in "${path.basename(folderPath)}".`);
            return false;
        }
        // 2. Destructive Action Warning: Ask for permission before modifying assets in place
        const confirmation = await vscode.window.showWarningMessage(`Are you sure you want to overwrite and reformat all PNG files in folder "${path.basename(folderPath)}"? 
        
WARNING: This action cannot be undone.`, { modal: true }, // Centred window modal forces direct confirmation
        "Yes, Overwrite All");
        if (confirmation !== "Yes, Overwrite All") {
            return false; // User opted out, exit cleanly
        }
        // 3. Execution & Progress: Wrap processing inside a VS Code loading indicator
        var totalFilesChanged = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Converting PNG assets inside ${path.basename(folderPath)}...`,
            cancellable: false
        }, async (progress) => {
            // Call your memory-safe UPNG translation pipeline
            return await processAndOverwritePngFolder(folderPath);
        });
        await vscode.window.showInformationMessage(`Successfully converted ${totalFilesChanged}/${pngCount} PNG file(s).`);
        // Finish
        return true;
    }
    catch (error) {
        // Handle system, system permissions, or corrupt image read blocks cleanly
        vscode.window.showErrorMessage(`Atari Converter Error: ${error.message}`);
    }
    return false;
}
/**
 * Scans a folder for PNGs, decodes them, and overwrites the originals with the re-encoded version.
 * @param targetDir The directory to process in-place.
 */
async function processAndOverwritePngFolder(targetDir) {
    // 1. Read files from the target directory
    const files = await fs.readdir(targetDir);
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
    if (pngFiles.length === 0) {
        console.log('No PNG files found to process.');
        return 0;
    }
    // 2. Processing Loop
    var count = 0;
    for (const file of pngFiles) {
        const filePath = path.join(targetDir, file);
        try {
            console.log(`Processing in-place: ${file}...`);
            // A. Read the entire file into memory FIRST
            const fileBuffer = await fs.readFile(filePath);
            const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
            // B. Run decoding and encoding entirely in memory
            const decodedImg = UPNG.decode(arrayBuffer);
            const rgbaFrames = UPNG.toRGBA8(decodedImg);
            const encodedArrayBuffer = UPNG.encode(rgbaFrames, decodedImg.width, decodedImg.height, 0 // Lossless encoding
            );
            // C. Safe Overwrite: Convert back to standard Node Buffer and write
            // This will instantly replace the file's old contents safely
            const outputBuffer = Buffer.from(encodedArrayBuffer);
            await fs.writeFile(filePath, outputBuffer);
            console.log(`Successfully overwritten: ${filePath}`);
            count++;
        }
        catch (error) {
            // NOTE: 
            console.error('An error occurred during in-place processing:', error);
        }
    }
    return count;
}
//# sourceMappingURL=converter.js.map
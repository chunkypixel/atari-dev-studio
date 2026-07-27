"use strict";
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as UPNG from './converter/vendor/UPNG.js';

export async function PromptUserToProcessPngsInFolder(uri: vscode.Uri): Promise<boolean> {
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
        vscode.window.showInformationMessage(
            `Operation cancelled: No .png files found in "${path.basename(folderPath)}".`
        );
        return false;
    }

    // 2. Destructive Action Warning: Ask for permission before modifying assets in place
    const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to overwrite and reformat all PNG files in folder "${path.basename(folderPath)}"? 
        
WARNING: This action cannot be undone.`,
        { modal: true }, // Centred window modal forces direct confirmation
        "Yes, Overwrite All"
    );

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

    await vscode.window.showInformationMessage(
      `Successfully converted ${totalFilesChanged}/${pngCount} PNG file(s).`);

    // Finish
    return true;

  } catch (error: any) {
      // Handle system, system permissions, or corrupt image read blocks cleanly
      vscode.window.showErrorMessage(`Atari Converter Error: ${error.message}`);
  }
  
  return false;
}

/**
 * Scans a folder for PNGs, decodes them, and overwrites the originals with the re-encoded version.
 * @param targetDir The directory to process in-place.
 */
export async function processAndOverwritePngFolder(targetDir: string): Promise<number> {
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
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset, 
        fileBuffer.byteOffset + fileBuffer.byteLength
      );

      // B. Run decoding and encoding entirely in memory
      const decodedImg = UPNG.decode(arrayBuffer);
      const rgbaFrames = UPNG.toRGBA8(decodedImg);
      
      const encodedArrayBuffer = UPNG.encode(
        rgbaFrames,
        decodedImg.width,
        decodedImg.height,
        0 // Lossless encoding
      );

      // C. Safe Overwrite: Convert back to standard Node Buffer and write
      // This will instantly replace the file's old contents safely
      const outputBuffer = Buffer.from(encodedArrayBuffer);
      await fs.writeFile(filePath, outputBuffer);

      console.log(`Successfully overwritten: ${filePath}`);
      count++;

    } catch (error) {
      // NOTE: 
      console.error('An error occurred during in-place processing:', error);
    }
  }

  return count;
}


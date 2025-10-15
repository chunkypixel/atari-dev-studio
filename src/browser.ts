"use strict";
import * as vscode from 'vscode';
import open, {openApp, apps} from 'open';

export async function OpenUrlInBrowser(url: string): Promise<void> {
  console.log('debugger:Browser.OpenUrlInBrowser');

  try {
    await open(url);
  } catch (error: unknown) {
    vscode.window.showErrorMessage(`Failed to open Web Browser. Please check if you have Chrome, Firefox or Edge correctly installed!`);
  }
}

export function GenerateNonce(): string {
    const array = new Uint8Array(16); // 16 bytes for a secure nonce
    crypto.getRandomValues(array); // Use Web Crypto API
    // Convert to base64, removing padding and non-alphanumeric characters
    const base64 = Buffer.from(array).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return base64;
}
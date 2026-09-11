"use strict";
import * as vscode from 'vscode';

export async function OpenUrlInBrowser(url: string): Promise<void> {
  console.log('debugger:Browser.OpenUrlInBrowser');

  const uri = vscode.Uri.parse(url);
  
  // This will open the URL directly in the user's default system browser
  const success = await vscode.env.openExternal(uri);
  if (!success) {
      vscode.window.showErrorMessage('Failed to open the browser link.');
  }
}

export function GenerateNonce(): string {
    const array = new Uint8Array(16); // 16 bytes for a secure nonce
    crypto.getRandomValues(array); // Use Web Crypto API
    // Convert to base64, removing padding and non-alphanumeric characters
    const base64 = Buffer.from(array).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return base64;
}
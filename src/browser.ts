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

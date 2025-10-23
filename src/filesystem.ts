// ...existing code...
"use strict";
import * as vscode from 'vscode';
import * as application from './application';
import * as path from 'path';
import { promises as fsp } from 'fs';
import type { Stats } from 'fs';

export async function FileExistsAsync(filePath: string): Promise<boolean> {
    try {
        await fsp.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function RenameFileAsync(oldName: string, newName: string): Promise<boolean> {
    try {
        await fsp.rename(oldName, newName);
        return true;
    } catch {
        return false;
    }
}

export async function GetFileStatsAsync(filePath: string): Promise<Stats | undefined> {
    try {
        const stats = await fsp.stat(filePath);
        return stats;
    } catch {
        return undefined;
    }
}

export async function RemoveFileAsync(filePath: string): Promise<boolean> {
    try {
        await fsp.unlink(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function FolderExistsAsync(folder: string): Promise<boolean> {
    try {
        await fsp.access(folder);
        return true;
    } catch {
        return false;
    }
}

export async function MkDirAsync(folder: string): Promise<boolean> {
    try {
        await fsp.mkdir(folder, { recursive: true });
        return true;
    } catch {
        return false;
    }
}

export async function ChModAsync(filePath: string, mode: number = 0o777): Promise<boolean> {
    try {
        await fsp.chmod(filePath, mode);
        return true;
    } catch (err: any) {
        application.WriteToCompilerTerminal(`- failed to set chmod permissions: ${err?.message ?? err}`, true, false);
        return false;
    }
}

export async function ReadFileAsync(filePath: string, encoding?: BufferEncoding): Promise<string | any> {
    try {
        const data = await fsp.readFile(filePath, encoding);
        return data;
    } catch {
        return undefined;
    }
}

export async function WriteFileAsync(filePath: string, data: string | Buffer): Promise<boolean> {
    try {
        await fsp.writeFile(filePath, data);
        return true;
    } catch {
        return false;
    }
}

export function WorkspaceFolder(): string {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return "";
}

export function GetFileExtension(uri: vscode.Uri): string {
    return path.extname(uri.fsPath);
}
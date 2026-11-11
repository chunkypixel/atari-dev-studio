"use strict";
import * as vscode from 'vscode';
import * as application from '../application';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export abstract class SerialBase {
    public readonly Id:string;
    public readonly Name: string;
    public FolderOrPath: string = "";
    protected FileName: string = "";  

    constructor(id:string, name:string, folderOrPath: string) {
        this.Id = id;
        this.Name = name;
        this.FolderOrPath = folderOrPath;
    }

    public async SendGameAsync(fileName: string): Promise<boolean> {
        // Set
        this.FileName = fileName;

        // Process
        return await this.ExecuteSerialAsync();
    }

    protected abstract ExecuteSerialAsync(): Promise<boolean>;
    
    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:SerialBase.InitialiseAsync');

        // Configuration
        return await this.LoadConfigurationAsync();
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:SerialBase.LoadConfigurationAsync');      
        // Result
        return true;
    }

    /**
     * Automatically attempts to find a connected 7800GD cartridge port path.
     * Falls back to returning undefined if no active ports are identified.
     */
    protected async AutoDetectComPort(): Promise<string | undefined> {
        try {
            // --- 1. LINUX AUTO-DETECTION ---
            if (application.IsLinux) {
                const stableIdPath = '/dev/serial/by-id';
                if (fs.existsSync(stableIdPath)) {
                    const files = fs.readdirSync(stableIdPath);
                    
                    // 1. Prioritize RetroHQ / 7800 / FTDI devices first
                    const priorityMatch = files.find(file => {
                        const lower = file.toLowerCase();
                        return lower.includes('retrohq') || 
                            lower.includes('7800') || 
                            lower.includes('ftdi');
                    });
                    
                    if (priorityMatch) {
                        return path.join(stableIdPath, priorityMatch);
                    }

                    // 2. Fallback to any other USB serial device in by-id
                    const genericUsbMatch = files.find(file => file.toLowerCase().startsWith('usb-'));
                    if (genericUsbMatch) {
                        return path.join(stableIdPath, genericUsbMatch);
                    }
                }
                
                // 3. Final fallback to standard virtual TTY interfaces
                const ttyDevices = ['/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyACM1'];
                for (const dev of ttyDevices) {
                    if (fs.existsSync(dev)) {
                        return dev;
                    }
                }
            }

            // --- 2. MACOS AUTO-DETECTION ---
            if (application.IsMacOS) {
                if (fs.existsSync('/dev')) {
                    const files = fs.readdirSync('/dev');
                    const match = files.find(file => {
                       const lower = file.toLowerCase();
                    return lower.startsWith('cu.') && 
                        (lower.includes('usb') || lower.includes('serial') || lower.includes('slab'));
                    });
                    if (match) {
                        return path.join('/dev', match);
                    }
                }
            }

            // --- 3. WINDOWS AUTO-DETECTION ---
            if (application.IsWindows) {
                // Uses simple wildcard matching in PowerShell to avoid regex escaping issues
                const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_PnPEntity | Where-Object { $_.Caption -like '*(COM*' } | Select-Object -ExpandProperty Caption"`;
                const { stdout } = await execAsync(cmd);
                
                if (stdout) {
                    const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    
                    // 1. Prioritize USB-based serial adapters (skips built-in motherboard COM1 ports)
                    const usbSerialPorts = lines.find(line => {
                        const lower = line.toLowerCase();
                        return lower.includes('usb serial') || 
                            lower.includes('usb-serial') ||
                            lower.includes('ftdi') || 
                            lower.includes('retrohq') || 
                            lower.includes('7800');
                    });
                    
                    const targetLine = usbSerialPorts;
                    if (targetLine) {
                        const comMatch = targetLine.match(/\((COM\d+)\)/i);
                        const portName = comMatch?.slice(1).shift();
                        if (portName) {
                            return portName.toUpperCase(); // Returns "COM4"
                        }
                    }
                }
            }
        } catch (error) {
            application.WriteToCompilerTerminal(`Failed auto-detecting 7800GD serial link: ${error instanceof Error ? error.message : String(error)}`);
        }

        return undefined; // No reliable port auto-detected
    }
}
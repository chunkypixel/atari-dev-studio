"use strict";
import * as vscode from 'vscode';
import * as application from './application';

export class StopWatch {
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private running: boolean = false;

  constructor() {
  }

  Start(): void {
    if (this.running) return;
    this.Reset();
    this.startTime = Date.now() - this.elapsedTime;
    this.running = true;
  }

  Stop(message: string = 'Completed build in '): void {
    if (!this.running) return;
    this.elapsedTime = Date.now() - this.startTime;
    this.running = false;
    this.display(message); // Show final time
  }

  Reset(): void {
    this.running = false;
    this.elapsedTime = 0;
    this.startTime = 0;
  }

  private display(message:string): void {
    // Calculate elapsed time
    const time = this.running ? Date.now() - this.startTime : this.elapsedTime;
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    // Format message
    let finalMessage = message;
    if (minutes > 0) finalMessage += `${minutes} minute${minutes !== 1 ? 's' : ''} and `;
    finalMessage += `${this.pad(seconds, (minutes > 0 ? 2 : 1))} second${seconds !== 1 ? 's' : ''}`;

    // Output
    application.WriteToCompilerTerminal();
    application.WriteToCompilerTerminal(finalMessage);
  }

  private pad(num: number, size: number = 2): string {
    return num.toString().padStart(size, '0');
  }
}

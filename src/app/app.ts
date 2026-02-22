import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutputComponent } from './output/output';
import { SocialBarComponent } from './social-bar/social-bar';
import { CommandRegistry, CommandContext } from './commands';

const ASCII_ART = String.raw`
  _   _       _   _             ____             
 | | | |     | | | |           |  _ \            
 | |_| | ___ | |_| |_   _ _   _| | | \_   _  ___ 
 |  _  |/ _ \|  _  | | | | | | | | | | | | |/ __|
 | | | | (_) | | | | |_| | |_| | |_| | |_| | (__ 
 |_| |_|\___/|_| |_|\__,_|\__,_|____/ \__,_|\___/
`;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, OutputComponent, SocialBarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(OutputComponent) output!: OutputComponent;
  @ViewChild('commandInput') commandInput!: ElementRef;
  @ViewChild('terminal') terminal!: ElementRef;
  @ViewChild('cursor') cursor!: ElementRef;

  inputLineDisplay = 'none';

  // Command history
  commandHistory: string[] = [];
  historyIndex = -1;

  constructor(
    private cdr: ChangeDetectorRef,
    private commandRegistry: CommandRegistry
  ) { }

  ngAfterViewInit() {
    this.runBootSequence();

    // Keep focus on input
    document.addEventListener('click', () => {
      if (this.commandInput) {
        this.commandInput.nativeElement.focus();
      }
    });
  }

  async printLine(text: string, speed = 30, className = 'command-output') {
    await this.output.printLine(text, speed, className);
  }

  printHtml(html: string) {
    this.output.printHtml(html);
  }

  getPromptHtml(cmd = "") {
    return `<div class="input-line">
          <span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">hohuuduc</span><span class="prompt-path">:~$</span><span>${cmd}</span>
      </div>`;
  }

  private createCommandContext(): CommandContext {
    return {
      printLine: (text: string, speed?: number, className?: string) =>
        this.output.printLine(text, speed ?? 30, className ?? 'command-output'),
      printHtml: (html: string) => this.output.printHtml(html),
      clear: () => this.output.clear(),
    };
  }

  async runBootSequence() {
    // ASCII Art
    await this.printLine(ASCII_ART, 5, 'ascii-art');

    // Show prompt and type command
    this.inputLineDisplay = 'flex';
    this.cdr.detectChanges();
    this.commandInput.nativeElement.focus();
    this.updateCursorPosition();
    await new Promise(r => setTimeout(r, 500));

    const commandToType = "about";

    // Simulate typing
    for (const char of commandToType) {
      this.commandInput.nativeElement.value += char;
      this.updateCursorPosition();
      await new Promise(r => setTimeout(r, 100));
    }

    await new Promise(r => setTimeout(r, 500));

    // Execute command
    this.commandInput.nativeElement.value = '';
    this.inputLineDisplay = 'none';
    this.cdr.detectChanges();

    await this.handleCommand(commandToType);

    // Show Prompt again for user interaction
    this.inputLineDisplay = 'flex';
    this.cdr.detectChanges();
    this.commandInput.nativeElement.focus();
    this.updateCursorPosition();
  }

  async handleCommand(cmd: string) {
    // Create history line
    this.printHtml(this.getPromptHtml(cmd));

    if (cmd.trim() === '') return;

    // Check for '&' to execute multiple commands sequentially
    if (cmd.includes('&')) {
      const commands = cmd.split('&').map(c => c.trim()).filter(c => c !== '');
      for (const singleCmd of commands) {
        await this.executeCommand(singleCmd);
      }
    } else {
      await this.executeCommand(cmd.trim());
    }
  }

  private async executeCommand(command: string) {
    const cmd = command.toLowerCase();
    const ctx = this.createCommandContext();
    await this.commandRegistry.execute(cmd, ctx);
  }

  updateCursorPosition() {
    if (!this.cursor || !this.commandInput) return;
    const input = this.commandInput.nativeElement;
    const cursor = this.cursor.nativeElement;

    const textBeforeCursor = input.value.substring(0, input.selectionStart);

    const span = document.createElement('span');
    span.style.font = window.getComputedStyle(input).font;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.textContent = textBeforeCursor;
    document.body.appendChild(span);

    const textWidth = span.offsetWidth;
    document.body.removeChild(span);

    const promptWidth = input.offsetLeft;
    cursor.style.left = (promptWidth + textWidth + 2) + 'px';
  }

  async onKeyDown(e: KeyboardEvent) {
    const input = this.commandInput.nativeElement;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.commandHistory.length > 0 && this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        this.updateCursorPosition();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        this.updateCursorPosition();
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        input.value = '';
        this.updateCursorPosition();
      }
    } else if (e.key === 'Enter') {
      const cmd = input.value;
      input.value = '';

      // Save to history (avoid duplicates and empty commands)
      if (cmd.trim() && (this.commandHistory.length === 0 || this.commandHistory[this.commandHistory.length - 1] !== cmd)) {
        this.commandHistory.push(cmd);
      }
      this.historyIndex = -1;

      this.inputLineDisplay = 'none';
      await this.handleCommand(cmd);
      this.inputLineDisplay = 'flex';
      this.cdr.detectChanges();
      setTimeout(() => {
        input.focus();
        this.terminal.nativeElement.scrollTo(0, document.body.scrollHeight);
        this.updateCursorPosition();
      });
    }
  }

  onInput() {
    this.updateCursorPosition();
  }
}

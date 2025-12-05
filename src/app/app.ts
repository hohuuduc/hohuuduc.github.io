import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('output') output!: ElementRef;
  @ViewChild('inputLine') inputLine!: ElementRef;
  @ViewChild('commandInput') commandInput!: ElementRef;
  @ViewChild('terminal') terminal!: ElementRef;
  @ViewChild('cursor') cursor!: ElementRef;

  inputLineDisplay = 'none';

  // Portfolio Data
  bio = `
NAME: Ho Huu Duc
ROLE: Software Engineer
EXP:  2 Years
LOC:  Vietnam

SUMMARY:
Software Engineer specializing in .NET and NodeJS.
Skilled in analyzing requirements, implementing user functionalities, and optimizing systems.
    `;

  projects = `
[DIR] PROJECTS
--------------
1. PROCES.S (Fujinet System)
   - ERP system for construction industry (.NET, Winform, SQL Server)
   
2. Lucky Draw (ALTA Software)
   - API for lucky draw system (ASP.NET MVC, Entity Framework, JWT)

3. ParcelWebApp (Personal)
   - CLI for quick Parcel deployment

4. Singleton DLL (Personal)
   - Object management library
    `;

  skills = `
[SYS] SKILLS LOADED
-------------------
LANGUAGES:  C#, JavaScript, TypeScript, SQL
FRAMEWORKS: .NET, NodeJS, ASP.NET MVC
DATABASES:  SQL Server, Oracle
CONCEPTS:   OOP, SOLID, Design Patterns
    `;

  help = `
AVAILABLE COMMANDS:
-------------------
about     - Display user information
skills    - List technical skills
projects  - List projects
clear     - Clear terminal screen
help      - Show this help message
    `;

  asciiArt = String.raw`
  _   _       _   _             ____             
 | | | |     | | | |           |  _ \            
 | |_| | ___ | |_| |_   _ _   _| | | \_   _  ___ 
 |  _  |/ _ \|  _  | | | | | | | | | | | | |/ __|
 | | | | (_) | | | | |_| | |_| | |_| | |_| | (__ 
 |_| |_|\___/|_| |_|\__,_|\__,_|____/ \__,_|\___|
`;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.runBootSequence();

    // Keep focus on input
    document.addEventListener('click', () => {
      if (this.commandInput) {
        this.commandInput.nativeElement.focus();
      }
    });
  }

  // Typing Effect
  async typeText(text: string, element: HTMLElement, speed = 30) {
    return new Promise<void>(resolve => {
      let i = 0;
      const type = () => {
        if (i < text.length) {
          if (text.charAt(i) === '\n') {
            element.innerHTML += '<br>';
            this.terminal.nativeElement.scrollTo(0, document.body.scrollHeight);
          } else if (text.charAt(i) === ' ') {
            element.innerHTML += '&nbsp;';
          } else {
            element.innerText += text.charAt(i);
          }
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      type();
    });
  }

  async printLine(text: string, speed = 30, className = 'command-output') {
    const line = this.renderer.createElement('div');
    line.className = className;
    this.renderer.appendChild(this.output.nativeElement, line);
    await this.typeText(text, line, speed);
  }

  printHtml(html: string) {
    const line = this.renderer.createElement('div');
    line.innerHTML = html;
    this.renderer.appendChild(this.output.nativeElement, line);
  }

  getPromptHtml(cmd = "") {
    return `<div class="input-line">
          <span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">hohuuduc</span><span class="prompt-path">:~$</span><span>${cmd}</span>
      </div>`;
  }

  async runBootSequence() {
    // 1. ASCII Art
    await this.printLine(this.asciiArt, 5, 'ascii-art');

    // 2. Show prompt first
    // 2. Show prompt and type command
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
    // clear input first because handleCommand will echo it
    this.commandInput.nativeElement.value = '';
    this.inputLineDisplay = 'none'; // Temporarily hide while processing like Enter key behavior
    this.cdr.detectChanges();

    await this.handleCommand(commandToType);

    // Show Prompt again for user interaction
    this.inputLineDisplay = 'flex';
    this.cdr.detectChanges();
    this.commandInput.nativeElement.focus();
    this.updateCursorPosition();
  }

  async handleCommand(cmd: string) {
    const command = cmd.trim().toLowerCase();

    // Create history line
    this.printHtml(this.getPromptHtml(cmd));

    if (command === '') return;

    switch (command) {
      case 'help':
        await this.printLine(this.help, 5);
        break;
      case 'about':
        await this.printLine(this.bio, 5);
        break;
      case 'skills':
        await this.printLine(this.skills, 5);
        break;
      case 'projects':
        await this.printLine(this.projects, 5);
        break;
      case 'clear':
        this.output.nativeElement.innerHTML = '';
        break;
      default:
        await this.printLine(`Command not found: ${command}. Type 'help' for list.`, 10);
    }
  }

  updateCursorPosition() {
    if (!this.cursor || !this.commandInput) return;
    const input = this.commandInput.nativeElement;
    const cursor = this.cursor.nativeElement;

    // Get the text before cursor position
    const textBeforeCursor = input.value.substring(0, input.selectionStart);

    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.font = window.getComputedStyle(input).font;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.textContent = textBeforeCursor;
    document.body.appendChild(span);

    // Calculate position
    const textWidth = span.offsetWidth;
    document.body.removeChild(span);

    const promptWidth = input.offsetLeft;
    cursor.style.left = (promptWidth + textWidth + 2) + 'px';
  }

  async onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const input = this.commandInput.nativeElement;
      const cmd = input.value;
      input.value = '';
      this.inputLineDisplay = 'none'; // Hide input while processing
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

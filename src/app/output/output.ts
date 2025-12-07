import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OutputLine {
    content: string;
    className: string;
    isHtml: boolean;
}

@Component({
    selector: 'app-output',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './output.html',
    styleUrls: ['./output.css']
})
export class OutputComponent implements OnInit {
    lines: OutputLine[] = [];

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        console.log("debug")
    }

    async printLine(text: string, speed = 30, className = 'command-output') {
        const line: OutputLine = { content: '', className, isHtml: false };
        this.lines.push(line);

        await this.typeText(text, line, speed);
    }

    printHtml(html: string) {
        this.lines.push({ content: html, className: '', isHtml: true });
    }

    clear() {
        this.lines = [];
    }

    // Typing Effect
    private async typeText(text: string, line: OutputLine, speed = 30) {
        return new Promise<void>(resolve => {
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    if (text.charAt(i) === '\n') {
                        line.content += '<br>';
                    } else if (text.charAt(i) === ' ') {
                        line.content += '&nbsp;';
                    } else {
                        // Escape HTML characters for safety
                        const char = text.charAt(i);
                        if (char === '<') line.content += '&lt;';
                        else if (char === '>') line.content += '&gt;';
                        else if (char === '&') line.content += '&amp;';
                        else line.content += char;
                    }
                    i++;
                    this.cdr.detectChanges();
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            type();
        });
    }
}


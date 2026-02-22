export interface CommandContext {
    printLine(text: string, speed?: number, className?: string): Promise<void>;
    printHtml(html: string): void;
    clear(): void;
}

export interface TerminalCommand {
    readonly name: string;
    readonly description: string;
    execute(ctx: CommandContext): Promise<void>;
}

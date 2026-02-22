import { Injectable } from '@angular/core';
import { TerminalCommand, CommandContext } from './command.types';
import { AboutCommand } from './about.command';
import { SkillsCommand } from './skills.command';
import { ProjectsCommand } from './projects.command';
import { ClearCommand } from './clear.command';
import { HelpCommand } from './help.command';
import { ChatCommand } from './chat.command';

@Injectable({ providedIn: 'root' })
export class CommandRegistry {
    private commands = new Map<string, TerminalCommand>();

    constructor() {
        this.register(new AboutCommand());
        this.register(new SkillsCommand());
        this.register(new ProjectsCommand());
        this.register(new ClearCommand());
        this.register(new HelpCommand(() => this.getAll()));
        this.register(new ChatCommand());
    }

    register(command: TerminalCommand): void {
        this.commands.set(command.name, command);
    }

    async execute(name: string, ctx: CommandContext): Promise<void> {
        const command = this.commands.get(name);
        if (command) {
            await command.execute(ctx);
        } else {
            await ctx.printLine(`Command not found: ${name}. Type 'help' for list.`, 10);
        }
    }

    getAll(): TerminalCommand[] {
        return Array.from(this.commands.values());
    }

    getSuggestions(prefix: string): string[] {
        if (!prefix) return [];
        const lower = prefix.toLowerCase();
        return Array.from(this.commands.keys())
            .filter(name => name.startsWith(lower) && name !== lower);
    }
}

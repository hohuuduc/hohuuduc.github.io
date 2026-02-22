import { TerminalCommand, CommandContext } from './command.types';

export class HelpCommand implements TerminalCommand {
    readonly name = 'help';
    readonly description = 'Show this help message';

    constructor(private getAllCommands: () => TerminalCommand[]) { }

    async execute(ctx: CommandContext): Promise<void> {
        const commands = this.getAllCommands();
        const maxNameLen = Math.max(...commands.map(c => c.name.length));

        const lines = commands
            .map(c => `${c.name.padEnd(maxNameLen + 2)}- ${c.description}`)
            .join('\n');

        const help = `AVAILABLE COMMANDS:\n-------------------\n${lines}`;
        await ctx.printLine(help, 5);
    }
}

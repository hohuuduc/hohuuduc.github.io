import { TerminalCommand, CommandContext } from './command.types';

export class AboutCommand implements TerminalCommand {
    readonly name = 'about';
    readonly description = 'Display user information';

    private readonly bio = `NAME: Ho Huu Duc
ROLE: Software Engineer
EXP:  2 Years
LOC:  Vietnam

SUMMARY:
Software Engineer specializing in .NET and NodeJS.
Skilled in analyzing requirements, implementing user functionalities, and optimizing systems.`;

    async execute(ctx: CommandContext): Promise<void> {
        await ctx.printLine(this.bio, 5);
    }
}

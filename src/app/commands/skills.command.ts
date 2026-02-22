import { TerminalCommand, CommandContext } from './command.types';

export class SkillsCommand implements TerminalCommand {
    readonly name = 'skills';
    readonly description = 'List technical skills';

    private readonly skills = `[SYS] SKILLS LOADED
-------------------
LANGUAGES:  C#, JavaScript, TypeScript, SQL
FRAMEWORKS: .NET, NodeJS, ASP.NET MVC
DATABASES:  SQL Server, Oracle
CONCEPTS:   OOP, SOLID, Design Patterns`;

    async execute(ctx: CommandContext): Promise<void> {
        await ctx.printLine(this.skills, 5);
    }
}

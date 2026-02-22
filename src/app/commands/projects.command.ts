import { TerminalCommand, CommandContext } from './command.types';

export class ProjectsCommand implements TerminalCommand {
    readonly name = 'projects';
    readonly description = 'List projects';

    private readonly projects = `[DIR] PROJECTS
--------------
1. PROCES.S (Fujinet System)
   - ERP system for construction industry (.NET, Winform, SQL Server)
   
2. Lucky Draw (ALTA Software)
   - API for lucky draw system (ASP.NET MVC, Entity Framework, JWT)

3. ParcelWebApp (Personal)
   - CLI for quick Parcel deployment

4. Singleton DLL (Personal)
   - Object management library`;

    async execute(ctx: CommandContext): Promise<void> {
        await ctx.printLine(this.projects, 5);
    }
}

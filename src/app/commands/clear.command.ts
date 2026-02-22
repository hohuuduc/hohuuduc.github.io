import { TerminalCommand, CommandContext } from './command.types';

export class ClearCommand implements TerminalCommand {
    readonly name = 'clear';
    readonly description = 'Clear terminal screen';

    async execute(ctx: CommandContext): Promise<void> {
        ctx.clear();
    }
}

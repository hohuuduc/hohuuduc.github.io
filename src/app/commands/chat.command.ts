import { TerminalCommand, CommandContext } from './command.types';

export class ChatCommand implements TerminalCommand {
    readonly name = 'chat';
    readonly description = 'Chat with bot';

    async execute(ctx: CommandContext): Promise<void> {
        await ctx.printLine("Test", 5);
    }
}

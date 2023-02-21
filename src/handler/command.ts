import { Client } from 'discord.js';
import * as cmds from '../commands/index';

export async function handle(client: Client): Promise<void> {
    Object.keys(cmds)
        .filter(k => k != 'default')
        .map(k => cmds[k as keyof typeof cmds])
        .forEach(c => {
            client.commands.set(c.meta.name, c);
        });
}
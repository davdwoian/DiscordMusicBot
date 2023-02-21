import { REST, Routes } from 'discord.js';
import { iGuild } from '../database/index';
import * as cmds from '../commands/index';

const CLIENT_TOKEN = process.env['CLIENT_TOKEN'] as string;
const CLIENT_ID = process.env['CLIENT_ID'] as string;

const rest = new REST({ version: '10' }).setToken(CLIENT_TOKEN);
const data = Object.keys(cmds)
    .filter(k => k != 'default')
    .map(k => cmds[k as keyof typeof cmds].meta);

export async function fetch(guildId: string): Promise<boolean> {
    try {
        
        console.log(`Fetching [${guildId}] ${data.length} (/) commands.`);
        
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, guildId),
            { body: data },
        );

        console.log(`Fetch [${guildId}] Success.`);
        return true;
        
    } catch (error) {
        
        console.log(`Fetch [${guildId}] Failed.`);
        console.log(error);
        return false;
        
    }
}

export async function deploy(): Promise<boolean> {
    const guilds = await iGuild.find();
    return (await Promise.all(guilds.map(g => fetch(g.guildId)))).every(x => x);
}

export default deploy;
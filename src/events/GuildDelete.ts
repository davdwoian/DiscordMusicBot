import { Events } from 'discord.js';
import { Guild } from 'discord.js'; 
import { iGuild } from '../database/index';
import { BotEvent } from '../types/index';

const name = Events.GuildDelete;
const once = false;

async function execute(guild: Guild): Promise<void> {
    try {
        
        const removeStatus = await iGuild.rmv(guild.id);
        if (!removeStatus) {
            throw new Error('Guild Exists');
        }
        
        console.log(`REMOVE User: ${guild.id}`);        
        
    } catch (error) {
        
    }
}

// --------------------------------------------------------------------------------

export const event: BotEvent = {
    name: name,
    execute: execute,
    once: once
}

export default event;

// --------------------------------------------------------------------------------

// import { User } from '../database';

// export const name = 'guildDelete';
// export const once = false;

// export async function execute(guild) {
//   if (await (User.rmv(guild.id))) {
//     console.log(`REMOVE User: ${guild.id}`);
//   }
// }

// export default {
//   name,
//   once,
//   execute
// }
import { Events } from 'discord.js';
import { Guild } from 'discord.js'; 
import { iGuild } from '../database';
import { BotEvent } from '../types/index';

const name = Events.GuildCreate;
const once = false;

async function execute(guild: Guild): Promise<void> {
    try {
        
        const addStatus = await iGuild.add(guild.id);
        if (!addStatus) {
            throw new Error('Guild Exists');
        }

        const fetchStatus = await fetch(guild.id);
        if (!fetchStatus) {
            throw new Error('Fetch Failed');
        }
        
        console.log(`NEW User: ${guild.id}`)
        
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
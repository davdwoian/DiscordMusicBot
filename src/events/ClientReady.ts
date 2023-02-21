import { Events } from 'discord.js';
import { Client } from 'discord.js';
import { BotEvent } from '../types/index';

const name = Events.ClientReady;
const once = true;

async function execute(client: Client): Promise<void> {
    try {
        
        if (!client || !client.user) {
            throw new Error('No Bot User');
        }
    
        console.log(`Logged In As: ${client.user.tag}`);
        
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
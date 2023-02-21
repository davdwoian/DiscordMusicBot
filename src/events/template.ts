import { Events } from 'discord.js';
import { BotEvent } from '../types/index';

// https://discord.js.org/#/docs/discord.js/main/class/Client
const name = Events.Warn;
const once = true;

async function execute(response: any): Promise<void> {
    try {
        
        console.log(`!Warning`);
        implementation(response);
        
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

function implementation(response: any) {
    console.log(response);
}

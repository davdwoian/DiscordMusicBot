import { Client, ClientEvents } from 'discord.js';
import * as events from '../events/index'

export async function handle(client: Client): Promise<void> {
    Object.keys(events)
        .filter(k => k != 'default')
        .map(k => events[k as keyof typeof events])
        .forEach(e => {
            if (e.once) {
                client.once(e.name as keyof ClientEvents, (...args: any[]) => e.execute(...args));
            } else {
                client.on(e.name as keyof ClientEvents, (...args: any[]) => e.execute(...args));
            }
        });
}
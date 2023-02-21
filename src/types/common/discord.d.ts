import { Collection } from "discord.js";
import { BotCommand } from '../discord';
import { Thread } from '../base';
    
declare module "discord.js" {
    export interface Client {
        commands: Collection<string, BotCommand>
        threads: Collection<string, Thread>
    }
}
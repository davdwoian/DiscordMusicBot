import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Events } from 'discord.js';
import { Message } from 'discord.js';

export interface BotCommand {
    /** preserve server's command execution thread, queue upcoming command request util finished */
    preserve: boolean,
    /** metadata fetched to discord server */
    meta: SlashCommandBuilder,
    /** response function to the interaction */
    execute(interaction: ChatInputCommandInteraction): Promise<any>,
	/** handle interaction created by the command */
	interactions?: Map<string, (...args: any) => any> 
}

export interface BotEvent {
    /** name of the discord.js event */
    name: Events,
    /** whether it is executed once */
    once: boolean,
    /**  response function to the event */
    execute(...args: any[]): Promise<any>
}

export interface BotDynamicMessage<T> {
	/** Container of the message */
	message: Message,
	/** Update action */
	update(target: T): Promise<void>,
	/** End action */
	end(target: T): Promise<void>
}

// export class CustomClient {

// }
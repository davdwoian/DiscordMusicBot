import { Events } from 'discord.js';
import { BaseInteraction, ButtonInteraction, StringSelectMenuInteraction, ChatInputCommandInteraction } from 'discord.js';
import { BotEvent } from '../types/index';
import { CommandProcess, CommandThread } from '../modules/Thread';
// import { queue } from '../api/youtubeMusic';

const name = Events.InteractionCreate;
const once = false;

const valid = ['1033611909666189312'];

async function execute(interaction: BaseInteraction): Promise<void> {
    // if (!valid.includes(interaction.guild?.id ? interaction.guild.id : '')) {
    //     return;
    // }
	if (interaction.isButton()) {
		acceptButton(interaction as ButtonInteraction);
		return;
	}
	
    if (interaction.isStringSelectMenu()) {
        acceptStringSelectMenu(interaction as StringSelectMenuInteraction); 
        return;
    }
    
    if (interaction.isChatInputCommand()) {
        acceptChatInputCommand(interaction as ChatInputCommandInteraction); 
        return;
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

async function acceptButton(interaction: ButtonInteraction): Promise<void> {
	try {

		const cid = interaction.customId.split('/')[0];
		if (!interaction.client.commands.has(cid)) {
			throw new Error('Interaction from Unknown Origin');
		}

		const handlerMap = interaction.client.commands.get(cid)!.interactions;
		if (!handlerMap || !handlerMap.has('button')) {
			throw new Error('Interaction not handled by command');
		}

		handlerMap.get('button')!(interaction);
		
	} catch (error) {
		
	}
}

async function acceptStringSelectMenu(interaction: StringSelectMenuInteraction): Promise<void> {
	try {
		
		const cid = interaction.customId.split('/')[0];
		if (!interaction.client.commands.has(cid)) {
			throw new Error('Interaction from Unknown Origin');
		}

		const handlerMap = interaction.client.commands.get(cid)!.interactions;
		if (!handlerMap || !handlerMap.has('stringSelectMenu')) {
			throw new Error('Interaction not handled by command');
		}

		handlerMap.get('stringSelectMenu')!(interaction);
		
	} catch (error) {
		
	}
}

async function acceptChatInputCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const cmd = interaction.client.commands.get(interaction.commandName);
    const threads = interaction.client.threads;
    
    try {
    
        if (!interaction.guild || !interaction.guild.id) {
            throw new Error(`No guild`);
        } 
        
        if (!cmd) {
            throw new Error(`No command ${interaction.commandName} was found.`);
        }
        
        if (!threads.has(interaction.guild.id)) {
            threads.set(interaction.guild.id, new CommandThread());
        }
		
        await interaction.reply({ content: `${interaction.user.tag}: /${cmd.meta.name}`, ephemeral: true });
        await threads.get(interaction.guild.id)?.run(new CommandProcess(cmd.preserve, [interaction], cmd.execute));
        // await cmd.execute(interaction);
        await interaction.deleteReply();
        
        console.log(`!COMMAND: /${cmd?.meta.name} [${interaction?.guild?.id}]`)

    } catch(error) {

        interaction.deleteReply();
        console.log(`!ERROR: ${error}`);
        
    }
}
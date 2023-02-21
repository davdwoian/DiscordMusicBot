import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember, MessageEditOptions } from 'discord.js';
import { BotCommand } from '../types/index';
import { queue } from '../application/music'


const preserve 	= false;

const meta = new SlashCommandBuilder()
    .setName('music-fetch')
    .setDescription('fetch music(s) from url')
	.addStringOption((opt) => opt
		.setName('url')
		.setDescription('resource locator of the music resource.')
		.setRequired(true)) as SlashCommandBuilder;

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	const url = interaction.options.getString('url')!

	try {
		
		if (!url) {
			throw new Error('Mutated Input');
		}
    
        const feed = await interaction.followUp('QUEUEING ...');
		const queueResponse = await queue(interaction.guild!.id, url);
		await feed.edit(queueResponse);
		
	} catch (error) {
		
	}
}

// --------------------------------------------------------------------------------

export const command: BotCommand = {
    meta: meta,
    execute: execute,
    preserve: preserve
}

export default command;

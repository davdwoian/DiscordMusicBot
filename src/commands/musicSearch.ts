import { ChatInputCommandInteraction, SlashCommandBuilder, MessageEditOptions } from 'discord.js';
import { ActionRowBuilder, StringSelectMenuBuilder, SelectMenuComponentOptionData, EmbedBuilder, APIActionRowComponent, APIStringSelectComponent } from 'discord.js';
import { StringSelectMenuInteraction } from 'discord.js';
import { BotCommand } from '../types/index';
import { query, queue } from '../application/music'

const DEFAULT_PREVIEW_LIFETIME = 10000;

const COMPONENT_MUSIC_SELECTION = 	new StringSelectMenuBuilder()
										.setCustomId('music-search')
										.setPlaceholder('Selecting music ...')
										.setMinValues(1)
										.setMaxValues(1)


const preserve 		= true;

const meta = new SlashCommandBuilder()
    .setName('music-search')
    .setDescription('search from music platform')
	.addStringOption((opt) => opt
		.setName('platform')
		.setDescription('music platform')
		.setRequired(true)
		.addChoices({ name: 'youtube', value: 'youtube' })
		.addChoices({ name: 'bilibili', value: 'bilibili' }))
	.addStringOption((opt) => opt
		.setName('type')
		.setDescription('type of result')
		.setRequired(true)
		.addChoices({ name: 'music', value: 'music'})
		.addChoices({ name: 'playlist', value: 'playlist' }))
	.addStringOption((opt) => opt
		.setName('content')
		.setDescription('content to search')
		.setRequired(true)) as SlashCommandBuilder

const reject0: string[] = []
const reject1: string[] = ['bilibili|playlist']

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	const platform	= interaction.options.getString('platform');
	const type 		= interaction.options.getString('type');
	const content 	= interaction.options.getString('content');

	try {
		
		if (!platform || !type || !content) {
			throw new Error('Unexpected User Input');
		}
		if (!(type == 'music' || type == 'playlist')) {
			throw new Error('Mutated Option');
		}
		if (reject0.includes(platform) || reject1.includes(`${platform}|${type}`)) {
			await interaction.followUp({ content: '> Service not available' })
			throw new Error('No permitted');
		}

		let feed = await interaction.followUp({ content: '> SEARCHING ...', embeds: [] });
		const res = await query(interaction.guild!.id, platform, type, content);
		
		const selection = res.embeds?.map((e): SelectMenuComponentOptionData => {
			const builder = e as EmbedBuilder;
			return {
				label: builder.data.title!,
				description: builder.data.footer?.text,
				value: builder.data.url!
			}
		})
		const menu = selection ? (new ActionRowBuilder().addComponents(COMPONENT_MUSIC_SELECTION.setOptions(selection))) : undefined;
		
		feed = await feed.edit({
			content: res.content,
			embeds: res.embeds,
			components: (menu ? [menu.toJSON() as APIActionRowComponent<APIStringSelectComponent>] : []) 
		});
		
	} catch (error) {
		
	}
}

async function onStringSelectMenu(interaction: StringSelectMenuInteraction) {
	try {
		
		const url = interaction.values[0]!;
		await interaction.deferUpdate();
		await interaction.editReply({ content: 'QUEUING ...', components: []});
		const queueResponse = await queue(interaction.guild!.id, url);
		await interaction.editReply(queueResponse);
		
	} catch (error) {
		
	}
}

// --------------------------------------------------------------------------------

export const command: BotCommand = {
    meta: meta,
    execute: execute,
    preserve: preserve,
	interactions: new Map<string, (...args: any) => any>([
		['stringSelectMenu', onStringSelectMenu]
	])
}

export default command;
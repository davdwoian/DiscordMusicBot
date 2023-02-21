import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../types/index';
import { getTime, playlist, remove } from '../application/music'
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder } from 'discord.js';
import { APISelectMenuOption, APIActionRowComponent, APIStringSelectComponent, APIButtonComponent } from 'discord.js';
import { StringSelectMenuInteraction, ButtonInteraction } from 'discord.js'

var choosed: Set<number> = new Set();


const preserve 	= true;

const meta = new SlashCommandBuilder()
    .setName('music-remove')
    .setDescription('remove music from playlist')

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	try {
		if (playlist(interaction.guild!.id).length == 0) {
			await interaction.followUp({ content: 'Playlist already emptied' });
			return;
		}
		
		choosed = new Set();
		
		const choices = playlist(interaction.guild!.id).map((v, i): APISelectMenuOption => { 
			return {
				label: `${String(i).padStart(2, '0')}: ${v.title}`, 
				description: v.authorName,
				value: String(i)
			}
		})
	
		const time = getTime(interaction.guild!.id);
		const components = splitMenu(choices, time).concat(formButton(time));
	    await interaction.followUp({ content: '> **__Music REMOVE Menu__**', components: components });
		
	} catch (error) {
		console.log(error);
	}
}


async function onStringSelectMenu(interaction: StringSelectMenuInteraction) {
	const [id, idx, time] = interaction.customId.split('/');
	await interaction.deferUpdate();
	
	if (parseInt(time) != getTime(interaction.guild!.id)) {
		await interaction.editReply({ content: '**__Remove Session Expired__**', components: [] });
		return;
	}

	interaction.values.forEach(v => choosed.add(parseInt(v)));
	const cont = Array.from(choosed).sort((a, b) => a - b);
	await interaction.editReply({ content: `**__Choosen Index:__** ${cont.map(x => `\`${x}\``).join('  ')}` });
}

async function onButton(interaction: ButtonInteraction) {
	const [id, idx, time] = interaction.customId.split('/');
	await interaction.deferUpdate();
	
	if (idx == '4') {
		await interaction.deleteReply();
		return;
	}
	if (parseInt(time) != getTime(interaction.guild!.id)) {
		await interaction.editReply({ content: '> **__REMOVE Session Expired__**', components: [] });
		return;
	}

	if (idx == '2' && choosed.size == 0) {
		await interaction.editReply({ content: '> No item selected' });
		return;
	}
	if (idx == '2') {
		await interaction.editReply(remove(interaction.guild!.id, choosed));
		return;
	}
	if (idx == '3') {
		choosed = new Set();
		await interaction.editReply({ content: '**__Music REMOVE Menu__**' });
		return;
	}
}

// --------------------------------------------------------------------------------

export const command: BotCommand = {
    meta: meta,
    execute: execute,
    preserve: preserve,
	interactions: new Map<string, (...args: any) => any>([
		['stringSelectMenu', onStringSelectMenu],
		['button', onButton]
	])
}

export default command;

// --------------------------------------------------------------------------------

function splitMenu(options: APISelectMenuOption[], time: number): APIActionRowComponent<any>[] {
	if (options.length > 50) return [];

	const base = new StringSelectMenuBuilder().setPlaceholder('select item to remove ...').setMinValues(0)

	const res: APIActionRowComponent<any>[] = [];

	const r0 = base.setCustomId(`music-remove/0/${time}`).setMaxValues(Math.min(options.length, 25)).setOptions(options.slice(0, 25)) as StringSelectMenuBuilder;
	res.push(new ActionRowBuilder().addComponents(r0).toJSON() as APIActionRowComponent<any>);
	if (options.length <= 25) return res;

	const r1 = base.setCustomId(`music-remove/1/${time}`).setMaxValues(options.length - 25).setOptions(options.slice(25))  as StringSelectMenuBuilder;
	res.push(new ActionRowBuilder().addComponents(r1).toJSON() as APIActionRowComponent<any>)
	return res;
}

function formButton(time: number): APIActionRowComponent<any> {
	const submit = new ButtonBuilder().setCustomId(`music-remove/2/${time}`).setLabel('remove').setStyle(1) as ButtonBuilder;
	const reset = new ButtonBuilder().setCustomId(`music-remove/3/${time}`).setLabel('reset').setStyle(2) as ButtonBuilder;
	const close = new ButtonBuilder().setCustomId(`music-remove/4/${time}`).setLabel('close').setStyle(2) as ButtonBuilder;
	
	return new ActionRowBuilder().addComponents([submit, reset, close]).toJSON() as APIActionRowComponent<any>;
}
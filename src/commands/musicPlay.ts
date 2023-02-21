import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember, MessageEditOptions } from 'discord.js';
import { BotCommand } from '../types/index';
import { play } from '../application/music'
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';


const preserve 	= false;

const meta = new SlashCommandBuilder()
    .setName('music-play')
    .setDescription('play music from the playlist')
	.addStringOption((opt) => opt
		.setName('mode')
		.setDescription('music iteration mode')
		.setRequired(true)
		.addChoices({ name: 'POP', value: 'POP' })
		.addChoices({ name: 'ITER', value: 'ITER' })
		.addChoices({ name: 'SINGLE', value: 'SINGLE' })
		.addChoices({ name: 'LOOP', value: 'LOOP' })) as SlashCommandBuilder;

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
	const mode = interaction.options.getString('mode')!

	try {
		
		if (!mode || !(mode == 'POP' || mode == 'ITER' || mode == 'SINGLE' || mode == 'LOOP')) {
			throw new Error('Mutated Option');
		}

        if (!interaction.member) {
            throw new Error('Command Request from unknown origin');
        }

        const member = interaction.member! as GuildMember
        if (!member.voice || !member.voice.channel) {
            throw new Error('Member not in voice channel');
        }
    
        const feed = await interaction.followUp('BUFFERING ...');
        joinVoiceChannel({
            
            channelId: member.voice.channel.id,
            guildId: interaction.guild!.id,
            adapterCreator: interaction.guild!.voiceAdapterCreator,
            
        });

		const err = await play(interaction.guild!.id, mode, feed);
		if (err) feed.edit(err);
		
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
// @ts-nocheck

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../types/index';

const preserve 	= true;

const meta = new SlashCommandBuilder()
    .setName('template')
    .setDescription('some description')

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.followUp('some message');
}

// --------------------------------------------------------------------------------

export const command: BotCommand = {
    meta: meta,
    execute: execute,
    preserve: preserve
}

export default command;
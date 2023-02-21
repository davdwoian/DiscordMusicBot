import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotCommand } from '../types/index';

var index = 0;


const preserve 	= true;

const meta = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ask BOCHI to say something')

async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // await new Promise((resolve) => setTimeout(() => resolve(0), 5000));
    await interaction.followUp(`${index ++}..... ?`);
}

// --------------------------------------------------------------------------------

export const command: BotCommand = {
    meta: meta,
    execute: execute,
    preserve: preserve
}

export default command;


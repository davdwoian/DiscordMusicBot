// @ts-nocheck

import { User } from '../database';
import { ApplicationCommandOptionType } from 'discord.js';

export const preserve = true;

export const data = {
  name: 'anime-account-sub',
  description: 'Change subscription account id',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'id',
      description: 'subscription account id',
      required: true,
    }
  ]
}

export async function execute(interaction) {
  const id = interaction.options.getString('id');
  await User.put(interaction.guild.id, 'schedule-id', id);
  interaction.followUp(`Subscription Account ID: **${id}**`);
}

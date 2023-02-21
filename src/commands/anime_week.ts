// @ts-nocheck

import { User } from '../database/index';
import { weeklyFeed } from '../api/animeSchedule';

export const data = {
  name: 'anime-week',
  description: "This week's anime schedule",
}

export async function execute(interaction) {
  let id = await User.get(interaction.guild.id, 'schedule-id');
  await interaction.followUp(await weeklyFeed(id));
}
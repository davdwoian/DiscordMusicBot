// @ts-nocheck

import { User } from '../database';
import { dailyFeed } from '../api/animeSchedule';

export const data = {
  name: 'anime-day',
  description: "Today's anime schedule",
}

export async function execute(interaction) {
  let id = await User.get(interaction.guild.id, 'schedule-id');
  await interaction.followUp(await dailyFeed(id));
}
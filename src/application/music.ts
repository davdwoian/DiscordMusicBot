import { MusicPlayer, MixedMusicPlayerConstructor } from '../modules/DCMusicPlayer/index';
import { BaseMessageOptions, Message, MessageEditOptions, MessageCreateOptions } from 'discord.js'; 
import { getVoiceConnection, AudioPlayerStatus } from '@discordjs/voice'
import { MusicMetadata, BotDynamicMessage } from '../types/index'

const TIME = new Map<string, number>();
const ALLOCATOR = new Map<string, MusicPlayer>();

class PlayerMessage implements BotDynamicMessage<MusicPlayer> {
	message: Message;

	constructor(message: Message) {
		this.message = message;
	}

	async update(player: MusicPlayer): Promise<void> {
		const msg =  {
			content: `**Playing Music with __${player.mode}__ Mode ...**`,
			embeds: [player.createEmbed(player.curItem!)],
			components: this.message.components
		}
		
		return this.message.fetch()
			.then(() => {
				this.message.edit(msg);
			})
			.catch(async () => {
				this.message = await this.message.channel.send(msg);
			})
	}

	async end(player: MusicPlayer): Promise<void> {
		const msg = {
			content: `> __**PLAY Session Ended: ${player.iterCnt} Song(s)**__`,
			embeds: [],
			components: []
		}

		return this.message.fetch()
			.then(() => {
				this.message.edit(msg);
			})
			.catch(async() => {
				this.message = await this.message.channel.send(msg);
			})
	}
} 

// I
function setTime(id: string): void {
	TIME.set(id, Date.now());
}

// I
export function getTime(id: string): number {
	if (!TIME.has(id)) setTime(id);
	return TIME.get(id)!;
}

// I
function init(id: string): MusicPlayer {
	if (!ALLOCATOR.has(id)) ALLOCATOR.set(id, MixedMusicPlayerConstructor());
	return ALLOCATOR.get(id)!
}

// I
export function playStatus(id: string): boolean {
	return init(id).playing;
}

// I 
export function playlist(id: string): MusicMetadata[] {
	return init(id).playlist;
}



// Q
export async function query(id: string, platform: string, type: 'music'|'playlist', query: string): Promise<BaseMessageOptions> {
	const player = init(id);
	const embeds = await player.query(platform, type, query);

	if (!embeds) {
		return {
			content: `> Fail To QUERY from ${platform.toUpperCase()}`,
			embeds: []
		}
	} else {
		return {
			content: `> RESULT from ${platform.toUpperCase()}`,
			embeds: embeds
		}
	}
}

// M
export async function queue(id: string, url: string): Promise<BaseMessageOptions> {
	const player = init(id);
	const embeds = await player.queue(url);

	if (player.playing) {
		return {
			content: `> Resource preserved, stop playing before modifying the playlist.`,
			embeds: [],
			components: []
		}
	}
	if (!embeds) {
		return {
			content: `> Fail to QUEUE, check if the url is valid and the playlist size is no more than 50`,
			embeds: [],
			components: []
		}
	} else {
		setTime(id);
		return {
			content: `> QUEUED the following music(s)`,
			embeds: [embeds],
			components: []
		}
	}
}

// M 
export function remove(id: string, idx: Set<number>): BaseMessageOptions {
	const player = init(id);
	if (player.playing) {
		return {
			content: `> Resource preserved, stop playing before modifying the playlist.`,
			embeds: [],
			components: []
		}
	}

	setTime(id);
	player.playlist = player.playlist.filter((v, i) => !idx.has(i));
	return {
		content: `> __**${idx.size}**__ music(s) have been removed`,
		embeds: [],
		components: []
	}
}


// M
export async function play(id: string, mode: "POP"|"ITER"|"SINGLE"|"LOOP", msg: Message): Promise<BaseMessageOptions|void> {
	const player = init(id);
	if (player.playing) {
		return {
			content: '> MusicPlayer already playing.',
			embeds: [],
			components: []
		}
	}

	const voice = getVoiceConnection(id);
	if (!voice) {
		return {
			content: '> Fail to get voice connection.',
			embeds: [],
			components: []
		};
	}

	setTime(id);
	voice.subscribe(player.player);
	if (!await player.play(mode, 0, new PlayerMessage(msg))) {
		return {
			content: '> Playing from an empty playlist.',
			embeds: [],
			components: []
		}
	}
}

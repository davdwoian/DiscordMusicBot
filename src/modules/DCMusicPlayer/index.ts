import { EmbedBuilder, EmbedData } from 'discord.js'
import { createAudioPlayer, AudioPlayer, AudioResource, NoSubscriberBehavior, AudioPlayerStatus } from "@discordjs/voice";
import { MusicMetadata, PlaylistMetadata, MusicPlatform, BotDynamicMessage } from "src/types";

import { parse } from 'url';

const MAX_PLAYLIST_SIZE = 50;
const DEFAULT_LOOP_ITERATION = 50;

export class MusicPlayer {
	// resources
    platform: Map<string, MusicPlatform<MusicMetadata, PlaylistMetadata, AudioResource<unknown>>>;
    playlist: MusicMetadata[];
    curItem?: MusicMetadata;

	// playStatus
    mode: "POP"|"ITER"|"SINGLE"|"LOOP";
	playing: boolean;
	currIdx: number;
    maxIter: number;
    iterCnt: number;

	// presentation
    dcout?: BotDynamicMessage<MusicPlayer>;
    player: AudioPlayer;
    
    constructor(platforms: MusicPlatform<MusicMetadata, PlaylistMetadata, AudioResource<unknown>>[]) {
        this.platform 	= new Map(platforms.map(p => [p.name, p]));
        this.playlist 	= [],
        this.mode 		= "POP";
		this.playing 	= false;
		this.currIdx	= 0;
        this.maxIter 	= DEFAULT_LOOP_ITERATION;
        this.iterCnt 	= 0;
		this.dcout		= undefined;
        this.player 	= this.initPlayer();
    }

	initPlayer(): AudioPlayer {
		return createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        }).on(AudioPlayerStatus.AutoPaused, async () => {
            
            if (this.dcout) await this.dcout.end(this);
            this.resetStatus();
            
        }).on('stateChange', async (os, ns) => {
            if (os.status != AudioPlayerStatus.Playing || ns.status != AudioPlayerStatus.Idle) return;

			this.stateUpdate();
            if (await (this.load())) return;
            
            if (this.dcout) await this.dcout.end(this);
			this.resetStatus();
            
        }).on('error', (e) => console.log(e));
	}

	async play(mode: "POP"|"ITER"|"SINGLE"|"LOOP", pos: number, msg: BotDynamicMessage<MusicPlayer>): Promise<boolean> {
		if (this.playing) return false;

		this.resetStatus();
		this.mode 		= mode;
		this.currIdx 	= pos;
		this.dcout 		= msg;
		this.playing 	= true;
		
		this.playing 	= await this.load();
		return this.playing;
    }

	stop(): boolean {
		this.playing = false;
        return this.player.stop(true);
    }

	stateUpdate() {
		this.iterCnt ++;
		
		switch (this.mode) {
			case 'POP': {
				this.playlist.pop();
				break;
			}
			case 'ITER': {
				this.currIdx ++;
				break;
			}
			case 'SINGLE': {
				break;
			}
			case 'LOOP': {
				this.currIdx = (this.currIdx + 1) % this.playlist.length;
				break;
			}
		}
	}

    async load(): Promise<boolean> {
        try {

			if (!this.playing) return false;
			
            if (this.playlist.length == 0) return false;
			
            if (this.mode == 'ITER' && this.currIdx >= this.playlist.length) return false;
			
            if ((this.mode == 'SINGLE' || this.mode == 'LOOP') && this.iterCnt == this.maxIter) return false;

			
			this.curItem = this.playlist[this.currIdx];
			const resource = await this.platform.get(this.curItem.platform)!.createMusicResource(this.curItem);
			if (!resource) throw new Error('Unable to create resource');
			
			if (this.dcout) this.dcout.update(this);
            this.player.play(resource);
            
            return true;
            
        } catch (error) {

			console.log(error)
            return false;
            
        }
	}
	
	async query(platform: string, type: 'music'|'playlist', query: string): Promise<EmbedBuilder[]|void> {
        try {

            if (!this.platform.has(platform)) throw new Error('Invalid Platform');
            
            const qry = await this.platform.get(platform)!.getMetadataFromQuery(type, query);
            if (!qry) throw new Error('Failed to Query from Platform');

            return qry.map(x => this.createEmbed(x, { author: undefined, footer: { text: x.authorName }, color: 4144959 }));
            
        } catch (error) {
            
        }
    }

    async queue(url: string): Promise<EmbedBuilder|void> {
        try {
			
			if (this.playing) throw new Error('Resource preserved');
            
            const domain = parse(url).hostname?.replace('www.', '').split('.')[0];
            if (!domain) throw new Error('Invalid URL');
			
            if (!this.platform.has(domain)) throw new Error('Invalid Platform Injection')

            const res = await this.platform.get(domain)!.resolveURL(url);
            if (!res) throw new Error('URL Resolve Failed');

            if (this.playlist.length + res.items.length > MAX_PLAYLIST_SIZE) throw new Error('Reached Maximum Size');

			
            const usable = res.items.filter(x => x.available);
			this.playlist = this.playlist.concat(usable);
			
			return this.createEmbed(res.meta, {
				fields: [
					{ 
						name: 'Filtered restricted content', 
						value: `[ ${res.items.length - usable.length } / ${res.items.length} ]`, 
						inline: true 
					}
				],
				color: 16718644
			});
            
        } catch (error) {
			
        }
    }
	
    shuffle(): void {
        for (let i = this.playlist.length - 1; i > 0; -- i) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        } 
    }

	createEmbed(meta: MusicMetadata|PlaylistMetadata, opts?: EmbedData): EmbedBuilder {
		return this.platform.get(meta.platform)!.createEmbed(meta, opts);
	}

	reset(): void {
		this.playlist 	= [];
		this.curItem	= undefined;
		this.mode		= "POP";
		this.playing 	= false;
		this.currIdx 	= 0;
		this.maxIter	= DEFAULT_LOOP_ITERATION;
		this.iterCnt	= 0;
		this.dcout		= undefined;
		this.player.stop(true);
	}

	resetStatus(): void {
		this.curItem	= undefined;
		this.mode 		= "POP";
		this.playing 	= false;
		this.currIdx	= 0;
		this.maxIter	= DEFAULT_LOOP_ITERATION;
		this.iterCnt	= 0;
		this.dcout		= undefined;
		this.player.stop(true);
	}
}




import YoutubePlatform from './youtube';
import BilibiliPlatform from './bilibili'

export function MixedMusicPlayerConstructor() {
    return new MusicPlayer([YoutubePlatform, BilibiliPlatform]);
}
// checked Except CreateResource 12-17, expect 12-18
import { PLATFORM_NAME } from '../api/youtube';

import { YtVideo, YtPlaylist } from '../api/youtube';
import { MusicPlatform } from '../../types/index';
import { EmbedData } from 'discord.js';
import { AudioResource } from '@discordjs/voice';

import { getVideosMetadata, getPlaylistsMetadata, getPlaylistItems } from '../api/youtube';
import { search as yts } from 'yt-search';
import ytdlp from 'youtube-dl-exec';
import { EmbedBuilder } from 'discord.js';
import { demuxProbe, createAudioResource } from '@discordjs/voice';
import { parse as uParse } from 'url';
import { parse as qParse } from 'querystring';

const PLATFORM_ICON = 'https://freeiconshop.com/wp-content/uploads/edd/youtube-flat.png';

const DEFAULT_SEARCH_SIZE = 3;

function validate(url: string): boolean {
	const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/)(?:watch\?v=|playlist\?list=)((?:\S+))$/;
	return regExp.test(url);
}

export async function getMetadataFromURL(url: string): Promise<YtVideo|YtPlaylist|void> {
    try {

		if (!validate(url)) {
			throw new Error('Invalid Youtube URL');
		}
		
        const u = uParse(url);
		const q = qParse(u.query!);
		
        if (u.pathname == '/watch') {
            const res = await getVideosMetadata(q.v!);
			return res![0];
        }
        if (u.pathname == '/playlist') {
            const res = await getPlaylistsMetadata(q.list!);
			return res![0];
        }

    } catch (error) {
        
    }
}

/** @dep yt-search */
export async function getMetadataFromQuery(type: "music"|"playlist", query: string, size: number = DEFAULT_SEARCH_SIZE): Promise<(YtVideo|YtPlaylist)[]|void> {
    try {

		if (type == 'music') {
			const qry = await yts(query);
			return qry.videos.splice(0, size).map((v): YtVideo => {
				return {
					platform: PLATFORM_NAME,
					videoId: v.videoId,
					title: v.title,
					time: v.timestamp,
					views: `${v.views}`,
					url: v.url,
					authorName: v.author.name,
					authorURL: v.author.url,
					thumbnail: v.thumbnail,
					available: true
				}
			});
		}
		if (type == 'playlist') {
			const qry = await yts({ query: query, sp: 'EgIQAw%253D%253D' });
			return qry.playlists.slice(0, size).map((p): YtPlaylist => {
				return {
					platform: PLATFORM_NAME,
					listId: p.listId,
					title: p.title,
					count: `${p.videoCount}`,
					url: p.url,
					authorName: p.author.name,
					authorURL: p.author.url,
					thumbnail: p.thumbnail
				}
			});
		}

    } catch (error) {

    }
}

export async function resolveURL(url: string): Promise<{meta: YtVideo|YtPlaylist, items: YtVideo[]}|void> {
    try {
        
        const meta = await getMetadataFromURL(url);
        if (!meta) {
            throw new Error('No URL Information');
        }
        
        if ('videoId' in meta) {
            return {meta: meta, items: [meta]};
        }
        if ('listId' in meta) {
            return {meta: meta, items: (await getPlaylistItems(meta.listId))!};
        }
        
    } catch (error) {

    }
}

export function createEmbed(meta: YtVideo|YtPlaylist, opts?: EmbedData): EmbedBuilder {
	if ('videoId' in meta) {
		const baseObject: EmbedData = {
			title: `${meta.title} [${meta.time}] @${meta.views}`,
			url: meta.url,
			author: {
				name: meta.authorName,
				url: meta.authorURL,
				iconURL: PLATFORM_ICON
			},
			thumbnail: { url: meta.thumbnail },
			footer: { text: PLATFORM_NAME },
			timestamp: Date.now()
		};
		return new EmbedBuilder({ ...baseObject, ...opts });
	} else {
		const baseObject: EmbedData = {
			title: `${meta.title} #${meta.count}`,
			url: meta.url,
			author: {
				name: meta.authorName,
				url: meta.authorURL,
				iconURL: PLATFORM_ICON
			},
			thumbnail: { url: meta.thumbnail },
			footer: { text: PLATFORM_NAME },
			timestamp: Date.now()
		};
		return new EmbedBuilder({ ...baseObject, ...opts })
	}
}

export async function createMusicResource(video: YtVideo): Promise<AudioResource<any>> {
    return new Promise((resolve, reject) => {
        const childproc = ytdlp.exec(video.url, {
            output: '-',
            quiet: true,
            format: 'ba[ext=webm][acodec=opus][asr=44100][abr<=128]/ba',
        }, { stdio: ['ignore', 'pipe', 'ignore'] });
		
        if (!childproc.stdout) {
            reject(new Error('No stdout'));
            return;
        };

        const consume = (error: Error) => {
            if (!childproc.killed) childproc.kill();
            childproc.stdout!.resume();
            reject(error);
        };
        childproc.once('spawn', async () => {
            demuxProbe(childproc.stdout!).then((probe: { stream: any; type: any; }) => {
                resolve(createAudioResource(probe.stream, { inputType: probe.type }));
            }).catch(consume);
        }).catch(consume);
    });
}

// --------------------------------------------------------------------------------

const platform: MusicPlatform<YtVideo, YtPlaylist, AudioResource<any>> = {
    name: PLATFORM_NAME,
    getMetadataFromURL: getMetadataFromURL,
    getMetadataFromQuery: getMetadataFromQuery,
    resolveURL: resolveURL,
    createEmbed: createEmbed,
    createMusicResource: createMusicResource
};

export default platform;
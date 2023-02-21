// checked Except CreateResource 12-17, expect 12-18
import { PLATFORM_NAME } from '../api/bilibili';

import { BbVideo, BbPlaylist } from '../api/bilibili';
import { MusicPlatform } from '../../types/index';
import { EmbedData } from 'discord.js';
import { AudioResource } from '@discordjs/voice';

import { getQueryResult, getVideosMetadata, getPlaylistsMetadata, getPlaylistItems } from '../api/bilibili';
import ytdlp from 'youtube-dl-exec';
import { EmbedBuilder } from 'discord.js';
import { demuxProbe, createAudioResource } from '@discordjs/voice';
import { parse as uParse } from 'url';

const PLATFORM_ICON = 'https://img.icons8.com/color/96/null/bilibili.png';

const DEFAULT_SEARCH_SIZE = 3;

function validate(url: string): boolean {
	const regExp = /(?:https?:\/\/)?(?:www\.)?(?:bilibili\.com\/)(?:video\/BV|medialist\/detail\/ml)((?:\S+))$/;
	return regExp.test(url);
}

export async function getMetadataFromURL(url: string): Promise<BbVideo|BbPlaylist|void> {
    try {

		if (!validate(url)) {
			throw new Error('Invalid Youtube URL');
		}
		
        const u = uParse(url);
		const p = u.pathname!.split('/');
		
        if (p[1] == 'video') {
            const res = await getVideosMetadata(p[2]);
			return res![0];
        }
        if (p[1] == 'medialist' && p[2] == 'detail') {
            const res = await getPlaylistsMetadata(p[3].slice(2));
			return res![0];
        }

    } catch (error) {
        
    }
}

/** @dep yt-search */
export async function getMetadataFromQuery(type: "music"|"playlist", query: string, size: number = DEFAULT_SEARCH_SIZE): Promise<(BbVideo|BbPlaylist)[]|void> {
    try {

		if (type == 'music') {
			return await getQueryResult(query, size);
		}
		if (type == 'playlist') {
			
		}

    } catch (error) {

    }
}

export async function resolveURL(url: string): Promise<{meta: BbVideo|BbPlaylist, items: BbVideo[]}|void> {
    try {
        
        const meta = await getMetadataFromURL(url);
        if (!meta) {
            throw new Error('No URL Information');
        }
        
        if ('bvid' in meta) {
            return {meta: meta, items: [meta]};
        }
        if ('id' in meta) {
            return {meta: meta, items: (await getPlaylistItems(meta.id))!};
        }
        
    } catch (error) {

    }
}

export function createEmbed(meta: BbVideo|BbPlaylist, opts?: EmbedData): EmbedBuilder {
	if ('bvid' in meta) {
		const baseObject: EmbedData = {
			title: `${meta.title} [${meta.time}] @${meta.views}`,
			description: meta.tags.map(x => `\`${x}\``).join('  '),
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

export async function createMusicResource(video: BbVideo): Promise<AudioResource<any>> {
    return new Promise((resolve, reject) => {
        const childproc = ytdlp.exec(video.url, {
            output: '-',
            quiet: true,
            format: 'ba[ext=webm][acodec=opus][asr<=44100][abr<=128]/ba'
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

const platform: MusicPlatform<BbVideo, BbPlaylist, AudioResource<any>> = {
    name: PLATFORM_NAME,
    getMetadataFromURL: getMetadataFromURL,
    getMetadataFromQuery: getMetadataFromQuery,
    resolveURL: resolveURL,
    createEmbed: createEmbed,
    createMusicResource: createMusicResource
};

export default platform;

// (async() => {
//     console.log(await getMetadataFromURL('https://www.bilibili.com/medialist/detail/ml1998063897?type=1&spm_id_from=333.999.0.0'));
// })()
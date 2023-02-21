//**  API Reference: https://developers.google.com/youtube/v3/docs */
import { MusicMetadata, PlaylistMetadata } from '../../types/index';
import { youtube } from '@googleapis/youtube';

export interface YtVideo extends MusicMetadata {
    videoId: string,
    restrict?: string[]|null
}

export interface YtPlaylist extends PlaylistMetadata {
    listId: string
}

export const PLATFORM_NAME	= 'youtube';
export const URL_VIDEO 		= 'https://www.youtube.com/watch?v=';
export const URL_PLAYLIST  	= 'https://www.youtube.com/playlist?list=';
export const URL_CHANNEL	= 'https://www.youtube.com/channel/';

const client = youtube({ version: 'v3', auth: process.env['API_YOUTUBE_KEY'] });

export async function getVideosMetadata(videoId: string[]|string): Promise<YtVideo[]|void> {
    try {

        const res = await client.videos.list({
            part: ['contentDetails', 'statistics', 'snippet'],
            id: (typeof videoId == 'string') ? [videoId] : videoId
        });
        const data = res.data;
        if (!data || !data.items) {
            throw new Error('No Valid Response from Youtube');
        }

        return data.items.map((v): YtVideo => {
            return {
                platform:	PLATFORM_NAME,
                videoId: 	v.id!,
                title: 		v.snippet!.title!,
                views: 		v.statistics!.viewCount!,
                time: 		v.contentDetails!.duration!,
                url: 		`${URL_VIDEO}${v.id}`,
                authorName: v.snippet!.channelTitle!,
                authorURL: 	`${URL_CHANNEL}${v.snippet!.channelId}`,
                thumbnail: 	Object.values(v.snippet!.thumbnails!)[0].url!,
                available: 	!v.contentDetails!.regionRestriction?.blocked || !v.contentDetails!.regionRestriction.blocked.includes('US')
            };
        })
        
    } catch (error) {
        
    }
}

export async function getPlaylistsMetadata(listId: string[]|string): Promise<YtPlaylist[]|void> {
    try {

        const res = await client.playlists.list({
            part: ['contentDetails', 'snippet'],
            id: (typeof listId == 'string') ? [listId] : listId
        });
        const data = res.data;
        if (!data || !data.items) {
            throw new Error('No Valid Response from Youtube');
        }

        return data.items.map((v): YtPlaylist => {
			return {
	            platform: 	PLATFORM_NAME,
	            listId: 	v.id!,
	            title: 		v.snippet!.title!,
	            count: 		`${v.contentDetails!.itemCount!}`,
	            url: 		`${URL_PLAYLIST}${v.id}`,
	            authorName: v.snippet!.channelTitle!,
	            authorURL: 	`${URL_CHANNEL}${v.snippet!.channelId!}`,
	            thumbnail: 	Object.values(v.snippet!.thumbnails!)[0].url!
			}
        });
        
    } catch (error) {
        
    }
}

export async function getPlaylistItems(listId: string): Promise<YtVideo[]|void> {
    try {

        const res = await client.playlistItems.list({
            part: ['contentDetails'],
            playlistId: listId,
            maxResults: 50
        });
        if (!res.data || !res.data.items) {
            throw new Error('No Valid Response from Youtube');
        }
        
        return await getVideosMetadata(res.data.items.map(v => v.contentDetails!.videoId!));
        
    } catch (error) {
        
    }
}
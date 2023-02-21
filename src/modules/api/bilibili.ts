//**  API Reference: https://developers.google.com/youtube/v3/docs */
import { MusicMetadata, PlaylistMetadata } from '../../types/index';
import axios from 'axios';
import { stripHtml } from 'string-strip-html'

const API_QUERY = 'https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=';
const API_VIDEO_LIST = 'https://api.bilibili.com/x/web-interface/view/detail?bvid=';
const API_FAVFOLDER_LIST = 'https://api.bilibili.com/x/v3/fav/folder/info?media_id=';
const API_FAVFOLDERITEMS_LIST = 'https://api.bilibili.com/x/v3/fav/resource/ids?media_id=';

interface APIQueryItem {
	type: string,
	id: number,
	author: string,
	mid: number,
	aid: number,
	bvid: string,
	title: string,
	/** url without protocol */
	pic?: string,
	play: number,
	tag?: string,
	duration: string
}

// http://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=
interface APIQueryResult {
	page: number,
	pagesize: number,
	numResults: number,
	numPages: number,
	result: APIQueryItem[]
}

interface APIPageInfo {
	cid: number,
	page: number,
	from?: string,
	part: string,
	/** seconds */
	duration: number
}

// http://api.bilibili.com/x/web-interface/view/detail?bvid=
interface APIVideoResult {
	View: {
		bvid: string,
		aid: number,
		videos?: number,
		/** url */
		pic?: string,
		title: string,
		/** seconds */
		duration: number,
		owner: { 
			mid: number,
			name: string
		},
		stat: {
			bvid: string,
			aid: number,
			view: number
		},
		pages: APIPageInfo[]
	},
	Tags?: {
		tag_name: string
	}[]
}

// http://api.bilibili.com/x/v3/fav/folder/info?media_id=
interface APIFavFolderResult {
	id: number,
	fid: number,
	mid: number,
	title?: string,
	/** url */
	cover?: string,
	upper: {
		mid: number,
		name: string,
		/** url */
		face?: string
	},
	media_count: number
}

// http://api.bilibili.com/x/v3/fav/resource/ids?media_id=
interface APIFavFolderItem {
	id: number,
	bvid: string
}

const headers = {
	'Cookie': '',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 Edg/93.0.961.52'
}
async function apiQuery(query: string): Promise<APIQueryResult|void> {
	try {
		
		var res = await axios.get(`${API_QUERY}${query}`, { headers: headers }).catch(err => err.response.data.code);
		
		if (res == -412) {
			const set = (await axios.head('https://bilibili.com')).headers['set-cookie'];
			headers.Cookie = set ? set.join(';') : '';
		}
		res = await axios.get(`${API_QUERY}${query}`, { headers: headers });
		
		const data = res.data.data;
		return data as APIQueryResult;
		
	} catch (error) {
		
	}
}

async function apiVideoList(bvid: string): Promise<APIVideoResult|void> {
	try {
		
		const res = await axios.get(`${API_VIDEO_LIST}${bvid}`);
		const data = res.data.data;
		return data as APIVideoResult;
		
	} catch (error) {
		
	}
}

async function apiFavFolderList(id: string): Promise<APIFavFolderResult|void> {
	try {
		
		const res = await axios.get(`${API_FAVFOLDER_LIST}${id}`);
		const data = res.data.data;
		return data as APIFavFolderResult;
		
	} catch (error) {
		
	}
}

async function apiFavFolderItemsList(id: string): Promise<APIFavFolderItem[]|void> {
	try {

		const res = await axios.get(`${API_FAVFOLDERITEMS_LIST}${id}`);
		const data = res.data.data;
		return data as APIFavFolderItem[]
		
	} catch (error) {
		
	}
}

/** 视频 */
export interface BbVideo extends MusicMetadata {
	bvid: string,
	tags: string[]
}

/** 收藏夹 */
export interface BbPlaylist extends PlaylistMetadata {
	id: string,	
}

export const PLATFORM_NAME = 'bilibili';
export const URL_VIDEO = 'https://www.bilibili.com/video/'; // 
export const URL_PLAYLIST = 'https://www.bilibili.com/medialist/detail/ml'; // fid
export const URL_CHANNEL = 'https://space.bilibili.com/'; // mid

export async function getQueryResult(query: string, size: number): Promise<BbVideo[]|void> {
	try {

		const res = await apiQuery(query);
		if (!res) {
			throw new Error('No Valid Response from Bilibili');
		}

		return res.result.slice(0, size).map(x => {
			return {
				platform: 	'bilibili',
				bvid: 		x.bvid,
				tags: 		String(x.tag).split(','),
				title: 		stripHtml(x.title).result,
				views: 		String(x.play),
				time: 		x.duration,
				url:		 `${URL_VIDEO}${x.bvid}`,
				authorName: x.author,
				authorURL: 	`${URL_CHANNEL}${x.mid}`,
				thumbnail: 	`${'http:'}${x.pic}`,
				available: 	true
			}
		});
		
	} catch (error) {
		
	}
}

export async function getVideosMetadata(bvid: string[]|string): Promise<BbVideo[]|void> {
    try {
		
		const bvids = typeof(bvid) == 'string' ? [bvid] : bvid;
		return Promise.all(bvids.map(async (id): Promise<BbVideo> => {
			const res = await apiVideoList(id);
			if (!res) {
				throw new Error('No Valid Response from Bilibli');
			}
			
			return {
				platform: 	PLATFORM_NAME,
				bvid:		res['View'].bvid,
				tags: 		res.Tags ? res.Tags.map(x => x.tag_name) : [],
				title: 		stripHtml(res.View.title).result,
				views:		String(res.View.stat.view),
				time: 		String(res.View.duration),
				url: 		`${URL_VIDEO}${res.View.bvid}`,
				authorName: res.View.owner.name,
				authorURL: 	`${URL_CHANNEL}${res.View.owner.mid}`,
				thumbnail: 	String(res.View.pic),
				available: 	true
			}
		}));
        
    } catch (error) {

    }
}

export async function getPlaylistsMetadata(id: string[]|string): Promise<BbPlaylist[]|void> {
	try {

		const ids = typeof(id) == 'string' ? [id] : id;
		return Promise.all(ids.map(async (f): Promise<BbPlaylist> => {
			const res = await apiFavFolderList(f);
			if (!res) {
				throw new Error('No Valid Response from Bilibili');
			}

			return {
				platform: 	'bilibili',
				id: 		f,
				title: 		stripHtml(String(res.title)).result,
				count:	 	String(res.media_count),
				url: 		`${URL_PLAYLIST}${f}`,
				authorName: res.upper.name,
				authorURL: 	`${URL_CHANNEL}${res.upper.mid}`,
				thumbnail:	 String(res.cover)
			}
		}))
		
	} catch (error) {
		
	}
}

export async function getPlaylistItems(id: string): Promise<BbVideo[]|void> {
    try {

        const res = await apiFavFolderItemsList(id);
        if (!res) {
            throw new Error('No Valid Response from Youtube');
        }

		return Promise.all(res.map(async (i): Promise<BbVideo> => {
			const v = await getVideosMetadata(i.bvid);
			return v![0]
		}))
        
    } catch (error) {
        
    }
}
import { EmbedBuilder, EmbedData } from 'discord.js';

export interface MusicMetadata {
    /** @remark platform should be the domain name*/
    platform: string,
    title: string,
    time: string,
    views: string,
    url: string,
    authorName: string,
    authorURL: string,
    thumbnail: string,
	available: boolean
}

export interface PlaylistMetadata {
    /** @remark platform should be the domain name*/
    platform: string,
    title: string,
    count: string,
    url: string,
    authorName: string,
    authorURL: string,
    thumbnail: string
}

export interface MusicPlatform<T extends MusicMetadata, K extends PlaylistMetadata, AudioResource> {
    name: string,
    getMetadataFromURL(url: string): Promise<T|K|void>,
    getMetadataFromQuery(type: 'music'|'playlist', query: string, size?: number): Promise<(T|K)[]|void>,
    resolveURL(url: string): Promise<{meta: T|K, items: T[]}|void>
    createEmbed(meta: T|K, opts?: EmbedData): EmbedBuilder,
    createMusicResource(meta: T): Promise<AudioResource>
}

// export interface MusicPlayer {
//     loader: T["createMusicResource"],
//     embeder: T["createEmbedFromMetadata"],
//     playlist: V[],
//     mode: "POP"|"ITER"|"SINGLE"|"LOOP",
//     maxIter: number,
//     iterCnt: number,
//     nextIdx: number,
//     curURL: string,
//     dcout?: Message,
//     player: AudioPlayer,
    
//     query(type: string, query: string, size: number): Promise<
//     status(): Promise<void>,
//     queue(url: string): Promise<boolean>,
//     load(): Promise<boolean>,
//     play(): Promise<boolean>,
//     stop(): boolean,
//     shuffle(): void
// }


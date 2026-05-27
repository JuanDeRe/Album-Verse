export type StickerStatus = 'unknown' | 'owned' | 'missing';

export interface Sticker {
    id: string;
    albumId: string;
    sectionId: string;
    code: string;
    number?: number;
    displayLabel: string;
    orderIndex: number;
    metadata?: Record<string, unknown>;
}

export interface AlbumSection {
    id: string;
    albumId: string;
    name: string;
    flag?: string;
    group?: string;
    orderIndex: number;
    stickerIds: string[];
    metadata?: Record<string, unknown>;
}

export interface Album {
    id: string;
    name: string;
    year?: number;
    collectionType: 'world-cup' | 'sports' | 'custom';
    totalStickers: number;
    sections: AlbumSection[];
    stickers: Sticker[];
    schemaVersion: number;
}

export interface UserSticker {
    stickerId: string;
    status: StickerStatus;
    quantityOwned: number;
    quantityDuplicate: number;
    updatedAt: string;
}

export type UserStickerMap = Record<string, UserSticker>;
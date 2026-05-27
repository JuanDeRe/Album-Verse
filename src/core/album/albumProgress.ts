import type { AlbumSection, UserStickerMap } from './album.types';

export interface AlbumProgress {
    total: number;
    owned: number;
    missing: number;
    unknown: number;
    percentage: number;
}

export function calculateAlbumProgress(stickers: UserStickerMap): AlbumProgress {
    const values = Object.values(stickers);

    const total = values.length;
    const owned = values.filter((sticker) => sticker.status === 'owned').length;
    const missing = values.filter((sticker) => sticker.status === 'missing').length;
    const unknown = values.filter((sticker) => sticker.status === 'unknown').length;
    const percentage = total === 0 ? 0 : Math.round((owned / total) * 100);

    return {
        total,
        owned,
        missing,
        unknown,
        percentage,
    };
}

export function calculateSectionProgress(
    section: AlbumSection,
    stickers: UserStickerMap,
): AlbumProgress {
    const sectionStickerMap = Object.fromEntries(
        section.stickerIds
            .map((stickerId) => stickers[stickerId])
            .filter(Boolean)
            .map((sticker) => [sticker.stickerId, sticker]),
    );

    return calculateAlbumProgress(sectionStickerMap);
}
import type { StickerStatus, UserSticker, UserStickerMap } from './album.types';

export function createInitialStickerMap(stickerIds: string[]): UserStickerMap {
    const now = new Date().toISOString();

    return Object.fromEntries(
        stickerIds.map((stickerId) => [
            stickerId,
            {
                stickerId,
                status: 'missing' satisfies StickerStatus,
                quantityOwned: 0,
                quantityDuplicate: 0,
                updatedAt: now,
            },
        ]),
    );
}

export function markStickerOwned(sticker: UserSticker): UserSticker {
    return {
        ...sticker,
        status: 'owned',
        quantityOwned: Math.max(1, sticker.quantityOwned),
        updatedAt: new Date().toISOString(),
    };
}

export function markStickerMissing(sticker: UserSticker): UserSticker {
    return {
        ...sticker,
        status: 'missing',
        quantityOwned: 0,
        quantityDuplicate: 0,
        updatedAt: new Date().toISOString(),
    };
}

export function cycleStickerStatus(sticker: UserSticker): UserSticker {
    const nextStatus: StickerStatus = sticker.status === 'owned' ? 'missing' : 'owned';

    return nextStatus === 'owned' ? markStickerOwned(sticker) : markStickerMissing(sticker);
}

export function setStickerStatus(sticker: UserSticker, status: StickerStatus): UserSticker {
    if (status === 'owned') return markStickerOwned(sticker);
    if (status === 'missing') return markStickerMissing(sticker);

    return {
        ...sticker,
        status,
        updatedAt: new Date().toISOString(),
    };
}

export function addDuplicate(sticker: UserSticker): UserSticker {
    return {
        ...sticker,
        status: 'owned',
        quantityOwned: Math.max(1, sticker.quantityOwned),
        quantityDuplicate: sticker.quantityDuplicate + 1,
        updatedAt: new Date().toISOString(),
    };
}

export function removeDuplicate(sticker: UserSticker): UserSticker {
    return {
        ...sticker,
        quantityDuplicate: Math.max(0, sticker.quantityDuplicate - 1),
        updatedAt: new Date().toISOString(),
    };
}
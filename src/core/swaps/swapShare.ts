import type { UserStickerMap } from '../album/album.types';
import type { SwapComparisonResult, SwapSharePayload } from './swapShare.types';

const PREFIX = 'SA1:';

function toBase64Url(value: string): string {
    return btoa(value)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');

    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

export function createSwapShareCode(albumId: string, stickers: UserStickerMap): string {
    const duplicateStickerIds = Object.values(stickers)
        .filter((sticker) => sticker.quantityDuplicate > 0)
        .map((sticker) => sticker.stickerId)
        .sort();

    const payload: SwapSharePayload = {
        v: 1,
        a: albumId,
        d: duplicateStickerIds,
    };

    return `${PREFIX}${toBase64Url(JSON.stringify(payload))}`;
}

export function parseSwapShareCode(code: string): SwapSharePayload {
    const trimmed = code.trim();

    if (!trimmed.startsWith(PREFIX)) {
        throw new Error('Código de intercambio inválido.');
    }

    const encoded = trimmed.slice(PREFIX.length);
    const decoded = fromBase64Url(encoded);
    const parsed = JSON.parse(decoded) as SwapSharePayload;

    if (parsed.v !== 1 || !parsed.a || !Array.isArray(parsed.d)) {
        throw new Error('Formato de intercambio no soportado.');
    }

    return {
        v: 1,
        a: parsed.a,
        d: Array.from(new Set(parsed.d)).sort(),
    };
}

export function compareSwapPayloadWithMyCollection(
    payload: SwapSharePayload,
    myStickers: UserStickerMap,
): SwapComparisonResult {
    const usefulStickerIds: string[] = [];
    const alreadyOwnedStickerIds: string[] = [];
    const unknownStickerIds: string[] = [];

    for (const stickerId of payload.d) {
        const mySticker = myStickers[stickerId];

        if (!mySticker) {
            unknownStickerIds.push(stickerId);
            continue;
        }

        if (mySticker.status === 'owned') {
            alreadyOwnedStickerIds.push(stickerId);
        } else {
            usefulStickerIds.push(stickerId);
        }
    }

    return {
        usefulStickerIds,
        alreadyOwnedStickerIds,
        unknownStickerIds,
    };
}
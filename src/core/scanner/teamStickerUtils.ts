import type { AlbumSection, Sticker } from '../album/album.types';

function extractCodeNumber(code: string): number | null {
    const match = code.match(/(\d+)/);
    return match ? Number(match[1]) : null;
}

function isNormalTeamSticker(sticker: Sticker): boolean {
    const number = extractCodeNumber(sticker.code);

    if (!number) return false;
    if (number < 1 || number > 20) return false;

    // Ignoramos variantes tipo BEL2s, GER15s, FRA20s por ahora.
    if (/s$/i.test(sticker.code)) return false;

    return true;
}

export function getNormalTeamStickerIdsForSection(
    section: AlbumSection,
    stickerById: Record<string, Sticker>,
): string[] {
    return section.stickerIds
        .map((stickerId) => stickerById[stickerId])
        .filter((sticker): sticker is Sticker => Boolean(sticker))
        .filter(isNormalTeamSticker)
        .sort((a, b) => {
            const aNumber = extractCodeNumber(a.code) ?? 0;
            const bNumber = extractCodeNumber(b.code) ?? 0;

            return aNumber - bNumber;
        })
        .map((sticker) => sticker.id);
}
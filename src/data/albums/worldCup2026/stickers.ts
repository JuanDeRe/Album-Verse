import type { Sticker } from '../../../core/album/album.types';
import { teams } from './teams';

export const WORLD_CUP_2026_ALBUM_ID = 'world-cup-2026';
export const STICKERS_PER_TEAM = 20;

export function getTeamStickerId(teamName: string, number: number): string {
    return `${teamName}#${number}`;
}

export function formatStickerLabel(stickerId: string): string {
    return stickerId.includes('#') ? stickerId.split('#')[1] : stickerId;
}

export function buildWorldCup2026Stickers(): Sticker[] {
    const stickers: Sticker[] = [];
    let orderIndex = 0;

    stickers.push({
        id: '00',
        albumId: WORLD_CUP_2026_ALBUM_ID,
        sectionId: 'intro-cover',
        code: '00',
        displayLabel: '00',
        orderIndex: orderIndex++,
    });

    for (let number = 1; number <= 8; number++) {
        stickers.push({
            id: `FWC${number}`,
            albumId: WORLD_CUP_2026_ALBUM_ID,
            sectionId: 'intro-fwc-1-8',
            code: `FWC${number}`,
            displayLabel: `FWC${number}`,
            orderIndex: orderIndex++,
        });
    }

    for (let number = 9; number <= 19; number++) {
        stickers.push({
            id: `FWC${number}`,
            albumId: WORLD_CUP_2026_ALBUM_ID,
            sectionId: 'intro-fwc-9-19',
            code: `FWC${number}`,
            displayLabel: `FWC${number}`,
            orderIndex: orderIndex++,
        });
    }

    for (const team of teams) {
        for (let number = 1; number <= STICKERS_PER_TEAM; number++) {
            const id = getTeamStickerId(team.name, number);

            stickers.push({
                id,
                albumId: WORLD_CUP_2026_ALBUM_ID,
                sectionId: `team-${team.id}`,
                code: id,
                number,
                displayLabel: String(number),
                orderIndex: orderIndex++,
                metadata: {
                    teamId: team.id,
                    teamName: team.name,
                    group: team.group,
                },
            });
        }
    }

    return stickers;
}
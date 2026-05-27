import type { AlbumSection } from '../../../core/album/album.types';
import { teams } from './teams';
import {
    getTeamStickerId,
    STICKERS_PER_TEAM,
    WORLD_CUP_2026_ALBUM_ID,
} from './stickers';

export function buildWorldCup2026Sections(): AlbumSection[] {
    const introSections: AlbumSection[] = [
        {
            id: 'intro-cover',
            albumId: WORLD_CUP_2026_ALBUM_ID,
            name: 'Album Cover',
            flag: '📖',
            group: '—',
            orderIndex: 0,
            stickerIds: ['00'],
        },
        {
            id: 'intro-fwc-1-8',
            albumId: WORLD_CUP_2026_ALBUM_ID,
            name: 'Trophy & Intro',
            flag: '🏆',
            group: '—',
            orderIndex: 1,
            stickerIds: Array.from({ length: 8 }, (_, index) => `FWC${index + 1}`),
        },
        {
            id: 'intro-fwc-9-19',
            albumId: WORLD_CUP_2026_ALBUM_ID,
            name: 'Hosts & Legends',
            flag: '⭐',
            group: '—',
            orderIndex: 2,
            stickerIds: Array.from({ length: 11 }, (_, index) => `FWC${index + 9}`),
        },
    ];

    const teamSections: AlbumSection[] = teams.map((team, index) => ({
        id: `team-${team.id}`,
        albumId: WORLD_CUP_2026_ALBUM_ID,
        name: team.name,
        flag: team.flag,
        group: team.group,
        orderIndex: index + introSections.length,
        stickerIds: Array.from({ length: STICKERS_PER_TEAM }, (_, stickerIndex) =>
            getTeamStickerId(team.name, stickerIndex + 1),
        ),
        metadata: {
            teamId: team.id,
            host: team.host ?? false,
        },
    }));

    return [...introSections, ...teamSections];
}
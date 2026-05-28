import type { Album, AlbumSection, Sticker } from '../../../core/album/album.types';
import type { PaniniCatalogFile } from './catalog.types';

export const WORLD_CUP_2026_ALBUM_ID = 'world-cup-2026';

const SECTION_FLAGS: Record<string, string> = {
    'We Are Panini': '📖',
    'FIFA World Cup 2026': '🏆',
    'Host Countries and Cities': '🏟️',
    'FIFA World Cup History': '⭐',

    Mexico: '🇲🇽',
    'South Africa': '🇿🇦',
    'South Korea': '🇰🇷',
    Czechia: '🇨🇿',
    Canada: '🇨🇦',
    'Bosnia and Herzegovina': '🇧🇦',
    Qatar: '🇶🇦',
    Switzerland: '🇨🇭',
    Brazil: '🇧🇷',
    Morocco: '🇲🇦',
    Haiti: '🇭🇹',
    Scotland: '🏴',
    USA: '🇺🇸',
    Paraguay: '🇵🇾',
    Australia: '🇦🇺',
    Türkiye: '🇹🇷',
    Germany: '🇩🇪',
    Curaçao: '🇨🇼',
    'Ivory Coast': '🇨🇮',
    Ecuador: '🇪🇨',
    Netherlands: '🇳🇱',
    Japan: '🇯🇵',
    Sweden: '🇸🇪',
    Tunisia: '🇹🇳',
    Belgium: '🇧🇪',
    Egypt: '🇪🇬',
    Iran: '🇮🇷',
    'New Zealand': '🇳🇿',
    Spain: '🇪🇸',
    'Cape Verde': '🇨🇻',
    'Saudi Arabia': '🇸🇦',
    Uruguay: '🇺🇾',
    France: '🇫🇷',
    Senegal: '🇸🇳',
    Iraq: '🇮🇶',
    Norway: '🇳🇴',
    Argentina: '🇦🇷',
    Algeria: '🇩🇿',
    Austria: '🇦🇹',
    Jordan: '🇯🇴',
    Portugal: '🇵🇹',
    'Congo DR': '🇨🇩',
    Uzbekistan: '🇺🇿',
    Colombia: '🇨🇴',
    England: '🏴',
    Croatia: '🇭🇷',
    Ghana: '🇬🇭',
    Panama: '🇵🇦',
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function extractNumberFromCode(code: string): number | undefined {
    const match = code.match(/(\d+)/);
    return match ? Number(match[1]) : undefined;
}

function getSectionFlag(team: string): string {
    return SECTION_FLAGS[team] ?? '📄';
}

export function buildAlbumFromPaniniCatalog(catalog: PaniniCatalogFile): Album {
    const sectionByTeam = new Map<string, AlbumSection>();
    const stickers: Sticker[] = [];

    catalog.stickers.forEach((catalogSticker, index) => {
        const sectionId = `section-${slugify(catalogSticker.team)}`;

        if (!sectionByTeam.has(catalogSticker.team)) {
            sectionByTeam.set(catalogSticker.team, {
                id: sectionId,
                albumId: WORLD_CUP_2026_ALBUM_ID,
                name: catalogSticker.team,
                flag: getSectionFlag(catalogSticker.team),
                orderIndex: sectionByTeam.size,
                stickerIds: [],
            });
        }

        const sticker: Sticker = {
            id: catalogSticker.code,
            albumId: WORLD_CUP_2026_ALBUM_ID,
            sectionId,
            code: catalogSticker.code,
            name: catalogSticker.name,
            team: catalogSticker.team,
            number: extractNumberFromCode(catalogSticker.code),
            displayLabel: catalogSticker.code,
            orderIndex: index,
        };

        stickers.push(sticker);
        sectionByTeam.get(catalogSticker.team)?.stickerIds.push(sticker.id);
    });

    const sections = Array.from(sectionByTeam.values());

    return {
        id: WORLD_CUP_2026_ALBUM_ID,
        name: catalog.edition || 'World Cup 2026',
        year: 2026,
        collectionType: 'world-cup',
        totalStickers: stickers.length,
        sections,
        stickers,
        schemaVersion: 2,
    };
}
import type { Album } from '../../../core/album/album.types';
import { buildWorldCup2026Sections } from './sections';
import { buildWorldCup2026Stickers, WORLD_CUP_2026_ALBUM_ID } from './stickers';

const stickers = buildWorldCup2026Stickers();
const sections = buildWorldCup2026Sections();

export const worldCup2026Album: Album = {
    id: WORLD_CUP_2026_ALBUM_ID,
    name: 'World Cup 2026',
    year: 2026,
    collectionType: 'world-cup',
    totalStickers: stickers.length,
    sections,
    stickers,
    schemaVersion: 1,
};
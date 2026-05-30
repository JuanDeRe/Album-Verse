import rawCatalog from './panini-wc-2026-catalog.json';
import type { PaniniCatalogFile } from './catalog.types';
import { buildAlbumFromPaniniCatalog } from './catalogParser';
import { manualWorldCup2026Stickers } from './manualCatalogStickers';

const catalog = rawCatalog as PaniniCatalogFile;

const existingCodes = new Set(catalog.stickers.map((sticker) => sticker.code));

const missingManualStickers = manualWorldCup2026Stickers.filter(
    (sticker) => !existingCodes.has(sticker.code),
);

const mergedCatalog: PaniniCatalogFile = {
    ...catalog,
    canonicalCount: catalog.canonicalCount + missingManualStickers.length,
    stickers: [...catalog.stickers, ...missingManualStickers],
};

export const worldCup2026Album = buildAlbumFromPaniniCatalog(mergedCatalog);
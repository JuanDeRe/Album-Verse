import rawCatalog from './panini-wc-2026-catalog.json';
import type { PaniniCatalogFile } from './catalog.types';
import { buildAlbumFromPaniniCatalog } from './catalogParser';

export const worldCup2026Album = buildAlbumFromPaniniCatalog(rawCatalog as PaniniCatalogFile);
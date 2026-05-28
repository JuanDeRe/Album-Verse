export interface PaniniCatalogSticker {
    code: string;
    name: string;
    team: string;
}

export interface PaniniCatalogFile {
    source: string;
    scrapedAt: string;
    edition: string;
    canonicalCount: number;
    cutoffRule?: string;
    stickers: PaniniCatalogSticker[];
}
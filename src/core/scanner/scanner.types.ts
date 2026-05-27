export interface ScannerInput {
    imageUri: string;
    albumId: string;
    sectionId: string;
}

export interface ScannerResult {
    albumId: string;
    sectionId: string;
    ownedStickerIds: string[];
    missingStickerIds: string[];
    uncertainStickerIds: string[];
    confidence: number;
    notes?: string;
}

export interface ScannerEngine {
    id: string;
    name: string;
    scan(input: ScannerInput): Promise<ScannerResult>;
}
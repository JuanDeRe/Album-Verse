export interface ScannerInput {
    imageUri: string;
    albumId: string;
    sectionId: string;
}

export interface ScannerEngine {
    id: string;
    name: string;
    scan(input: ScannerInput): Promise<unknown>;
}
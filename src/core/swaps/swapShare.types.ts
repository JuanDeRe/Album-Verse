export interface SwapSharePayload {
    v: 1;
    a: string;
    d: string[];
}

export interface SwapComparisonResult {
    usefulStickerIds: string[];
    alreadyOwnedStickerIds: string[];
    unknownStickerIds: string[];
}
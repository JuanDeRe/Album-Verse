export type ScannerDetectionStatus = 'owned' | 'missing' | 'uncertain';

export interface ScannerCropBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface ScannerSlotResult {
    stickerId: string;
    detectedStatus: ScannerDetectionStatus;
    confidence: number;
    metrics?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        edgeScore?: number;
        whiteRatio?: number;
        centerWhiteRatio?: number;
        centerSaturation?: number;
        centerContrast?: number;
        centerEdgeScore?: number;
        occupiedScore?: number;
    };
}

export interface TeamPageScanResult {
    sectionId: string;
    layoutId: string;
    analyzedAt: string;
    imageName?: string;
    results: ScannerSlotResult[];
    notes?: string;
}

export interface AnalyzeTeamPageInput {
    imageFile: File;
    sectionId: string;
    layoutId: string;
    scanSlots: ScannerSlotLayout[];
    rotationDegrees: number;
    cropBox: ScannerCropBox;
}
export type ScannerDetectionProfile =
    | 'team'
    | 'intro'
    | 'history'
    | 'coca-cola'
    | 'host-countries';

export interface ScannerSlotLayout {
    stickerId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    detectionProfile?: ScannerDetectionProfile;
}

export interface ScannerPageLayout {
    id: string;
    label: string;
    description?: string;
    detectionProfile: ScannerDetectionProfile;
    slots: ScannerSlotLayout[];
}
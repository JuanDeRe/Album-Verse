export type ScannerDetectionStatus = 'owned' | 'missing' | 'uncertain';

export type ScannerDetectionProfile =
    | 'team'
    | 'intro'
    | 'history'
    | 'coca-cola'
    | 'host-countries';

export interface ScannerCropBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

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

export interface ScannerSlotResult {
    stickerId: string;
    detectedStatus: ScannerDetectionStatus;
    confidence: number;
    detectionProfile?: ScannerDetectionProfile;
    autoSelected?: boolean;
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

        ringBrightness?: number;
        ringSaturation?: number;
        ringContrast?: number;
        ringEdgeScore?: number;

        centerRingDifference?: number;
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
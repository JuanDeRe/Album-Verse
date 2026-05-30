import type {
    AnalyzeTeamPageInput,
    ScannerDetectionProfile,
    ScannerDetectionStatus,
    ScannerSlotResult,
    TeamPageScanResult,
} from '../../core/scanner/teamScanner.types';

interface SlotMetrics {
    brightness: number;
    contrast: number;
    saturation: number;
    edgeScore: number;
    whiteRatio: number;
    centerWhiteRatio: number;
    centerSaturation: number;
    centerContrast: number;
    centerEdgeScore: number;
    occupiedScore: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function normalize01(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return clamp((value - min) / (max - min), 0, 1);
}

function rgbToSaturation(r: number, g: number, b: number): number {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;

    if (max === 0) return 0;

    return (max - min) / max;
}

function luminance(r: number, g: number, b: number): number {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function createImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo cargar la imagen.'));
        };

        image.src = url;
    });
}

function drawImageToCanvas(
    image: HTMLImageElement,
    rotationDegrees: number,
    maxLongSide = 1500,
): HTMLCanvasElement {
    const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
    const swapsDimensions = normalizedRotation === 90 || normalizedRotation === 270;

    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;

    const rotatedWidth = swapsDimensions ? originalHeight : originalWidth;
    const rotatedHeight = swapsDimensions ? originalWidth : originalHeight;

    const scale = Math.min(1, maxLongSide / Math.max(rotatedWidth, rotatedHeight));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(rotatedWidth * scale);
    canvas.height = Math.round(rotatedHeight * scale);

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('No se pudo crear canvas.');
    }

    context.save();

    if (normalizedRotation === 90) {
        context.translate(canvas.width, 0);
        context.rotate(Math.PI / 2);
        context.drawImage(image, 0, 0, canvas.height, canvas.width);
    } else if (normalizedRotation === 180) {
        context.translate(canvas.width, canvas.height);
        context.rotate(Math.PI);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    } else if (normalizedRotation === 270) {
        context.translate(0, canvas.height);
        context.rotate((3 * Math.PI) / 2);
        context.drawImage(image, 0, 0, canvas.height, canvas.width);
    } else {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    context.restore();

    return canvas;
}

function cropCanvas(
    sourceCanvas: HTMLCanvasElement,
    cropBox: AnalyzeTeamPageInput['cropBox'],
): HTMLCanvasElement {
    const left = clamp(cropBox.left, 0, 0.45);
    const top = clamp(cropBox.top, 0, 0.45);
    const right = clamp(cropBox.right, 0, 0.45);
    const bottom = clamp(cropBox.bottom, 0, 0.45);

    const sourceX = Math.round(left * sourceCanvas.width);
    const sourceY = Math.round(top * sourceCanvas.height);
    const sourceW = Math.round(sourceCanvas.width * (1 - left - right));
    const sourceH = Math.round(sourceCanvas.height * (1 - top - bottom));

    const safeW = Math.max(20, sourceW);
    const safeH = Math.max(20, sourceH);

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = safeW;
    outputCanvas.height = safeH;

    const context = outputCanvas.getContext('2d');

    if (!context) {
        throw new Error('No se pudo crear canvas recortado.');
    }

    context.drawImage(sourceCanvas, sourceX, sourceY, safeW, safeH, 0, 0, safeW, safeH);

    return outputCanvas;
}

function getSlotImageData(
    canvas: HTMLCanvasElement,
    slot: { x: number; y: number; w: number; h: number },
): ImageData {
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('No se pudo leer canvas.');
    }

    const x = Math.round(slot.x * canvas.width);
    const y = Math.round(slot.y * canvas.height);
    const w = Math.round(slot.w * canvas.width);
    const h = Math.round(slot.h * canvas.height);

    const safeX = clamp(x, 0, canvas.width - 1);
    const safeY = clamp(y, 0, canvas.height - 1);
    const safeW = clamp(w, 1, canvas.width - safeX);
    const safeH = clamp(h, 1, canvas.height - safeY);

    return context.getImageData(safeX, safeY, safeW, safeH);
}

function calculateSlotMetrics(imageData: ImageData): SlotMetrics {
    const { data, width, height } = imageData;

    const luminances: number[] = [];
    const saturations: number[] = [];

    const centerLuminances: number[] = [];
    const centerSaturations: number[] = [];

    let whitePixels = 0;
    let centerWhitePixels = 0;
    let centerPixelCount = 0;

    const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 4500)));

    /**
     * Centro útil del slot.
     * Esto reduce falsos positivos causados por fondos rojos/azules/naranjas
     * fuera del área real de la lámina.
     */
    const centerLeft = width * 0.22;
    const centerRight = width * 0.78;
    const centerTop = height * 0.22;
    const centerBottom = height * 0.78;

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;

            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            const lum = luminance(r, g, b);
            const sat = rgbToSaturation(r, g, b);

            luminances.push(lum);
            saturations.push(sat);

            const isWhiteish = lum > 205 && sat < 0.3;

            if (isWhiteish) {
                whitePixels += 1;
            }

            const isCenter =
                x >= centerLeft && x <= centerRight && y >= centerTop && y <= centerBottom;

            if (isCenter) {
                centerPixelCount += 1;
                centerLuminances.push(lum);
                centerSaturations.push(sat);

                if (isWhiteish) {
                    centerWhitePixels += 1;
                }
            }
        }
    }

    const count = Math.max(1, luminances.length);

    const avgLum = luminances.reduce((sum, value) => sum + value, 0) / count;
    const avgSat = saturations.reduce((sum, value) => sum + value, 0) / count;

    const variance =
        luminances.reduce((sum, value) => sum + Math.pow(value - avgLum, 2), 0) / count;

    const contrast = Math.sqrt(variance);
    const whiteRatio = whitePixels / count;

    const safeCenterPixelCount = Math.max(1, centerPixelCount);
    const centerWhiteRatio = centerWhitePixels / safeCenterPixelCount;

    const centerSaturation =
        centerSaturations.reduce((sum, value) => sum + value, 0) /
        Math.max(1, centerSaturations.length);

    const centerAvgLum =
        centerLuminances.reduce((sum, value) => sum + value, 0) /
        Math.max(1, centerLuminances.length);

    const centerVariance =
        centerLuminances.reduce((sum, value) => sum + Math.pow(value - centerAvgLum, 2), 0) /
        Math.max(1, centerLuminances.length);

    const centerContrast = Math.sqrt(centerVariance);

    let edgeTotal = 0;
    let edgeCount = 0;

    let centerEdgeTotal = 0;
    let centerEdgeCount = 0;

    for (let y = step; y < height - step; y += step) {
        for (let x = step; x < width - step; x += step) {
            const centerIndex = (y * width + x) * 4;
            const rightIndex = (y * width + (x + step)) * 4;
            const bottomIndex = ((y + step) * width + x) * 4;

            const c = luminance(data[centerIndex], data[centerIndex + 1], data[centerIndex + 2]);
            const r = luminance(data[rightIndex], data[rightIndex + 1], data[rightIndex + 2]);
            const b = luminance(data[bottomIndex], data[bottomIndex + 1], data[bottomIndex + 2]);

            const edgeValue = Math.abs(c - r) + Math.abs(c - b);

            edgeTotal += edgeValue;
            edgeCount += 2;

            const isCenter =
                x >= centerLeft && x <= centerRight && y >= centerTop && y <= centerBottom;

            if (isCenter) {
                centerEdgeTotal += edgeValue;
                centerEdgeCount += 2;
            }
        }
    }

    const edgeScoreRaw = edgeCount === 0 ? 0 : edgeTotal / edgeCount;
    const centerEdgeScoreRaw = centerEdgeCount === 0 ? 0 : centerEdgeTotal / centerEdgeCount;

    const centerContrastNorm = normalize01(centerContrast, 15, 55);
    const centerSaturationNorm = normalize01(centerSaturation, 0.1, 0.4);
    const centerEdgeNorm = normalize01(centerEdgeScoreRaw, 6, 34);
    const centerWhitePenalty = normalize01(centerWhiteRatio, 0.28, 0.72);

    /**
     * Score principal basado en el centro.
     * Esto mantiene bien los equipos y reduce problemas en fondos muy saturados.
     */
    const occupiedScore = clamp(
        centerContrastNorm * 0.36 +
        centerSaturationNorm * 0.28 +
        centerEdgeNorm * 0.42 -
        centerWhitePenalty * 0.3,
        0,
        1,
    );

    return {
        brightness: avgLum,
        contrast,
        saturation: avgSat,
        edgeScore: edgeScoreRaw,
        whiteRatio,
        centerWhiteRatio,
        centerSaturation,
        centerContrast,
        centerEdgeScore: centerEdgeScoreRaw,
        occupiedScore,
    };
}

function classifySlot(
    metrics: SlotMetrics,
    profile: ScannerDetectionProfile = 'team',
    stickerId?: string,
): {
    status: ScannerDetectionStatus;
    confidence: number;
} {
    if (profile === 'coca-cola') {
        return classifyCocaColaSlot(metrics);
    }

    if (profile === 'history') {
        return classifyHistorySlot(metrics);
    }

    if (profile === 'intro' || profile === 'host-countries') {
        return classifyIntroSlot(metrics, stickerId);
    }

    return classifyTeamSlot(metrics);
}

function classifyTeamSlot(metrics: SlotMetrics): {
    status: ScannerDetectionStatus;
    confidence: number;
} {
    const score = metrics.occupiedScore;

    const centerHasStickerTexture =
        metrics.centerContrast >= 34 ||
        metrics.centerEdgeScore >= 24 ||
        metrics.centerSaturation >= 0.28;

    const centerHasStrongStickerTexture =
        metrics.centerContrast >= 42 ||
        metrics.centerEdgeScore >= 30 ||
        metrics.centerSaturation >= 0.34;

    if (
        metrics.centerWhiteRatio >= 0.48 &&
        metrics.centerSaturation < 0.24 &&
        metrics.centerContrast < 30 &&
        metrics.centerEdgeScore < 20
    ) {
        return {
            status: 'missing',
            confidence: normalize01(metrics.centerWhiteRatio, 0.48, 0.82),
        };
    }

    if (centerHasStrongStickerTexture && score >= 0.34) {
        return {
            status: 'owned',
            confidence: normalize01(score, 0.34, 0.78),
        };
    }

    if (centerHasStickerTexture && score >= 0.42) {
        return {
            status: 'owned',
            confidence: normalize01(score, 0.42, 0.78),
        };
    }

    if (metrics.centerWhiteRatio >= 0.4 && score < 0.46) {
        return {
            status: 'uncertain',
            confidence: 0.5,
        };
    }

    if (score >= 0.5) {
        return {
            status: 'owned',
            confidence: normalize01(score, 0.5, 0.82),
        };
    }

    if (score <= 0.24) {
        return {
            status: 'missing',
            confidence: normalize01(0.24 - score, 0, 0.24),
        };
    }

    return {
        status: 'uncertain',
        confidence: clamp(1 - Math.abs(score - 0.37) / 0.13, 0, 1),
    };
}

function classifyCocaColaSlot(metrics: SlotMetrics): {
    status: ScannerDetectionStatus;
    confidence: number;
} {
    const hasRealStickerTexture =
        metrics.centerContrast >= 40 ||
        metrics.centerEdgeScore >= 31 ||
        metrics.centerSaturation >= 0.38;

    const hasStrongStickerTexture =
        metrics.centerContrast >= 48 ||
        metrics.centerEdgeScore >= 38 ||
        metrics.centerSaturation >= 0.44;

    /**
     * Fondo Coca-Cola genera muchos falsos positivos por rojo/blanco.
     * Por eso pedimos textura central fuerte antes de marcar como pegada.
     */
    if (
        metrics.centerContrast < 34 &&
        metrics.centerEdgeScore < 27 &&
        metrics.occupiedScore < 0.58
    ) {
        return {
            status: 'missing',
            confidence: 0.62,
        };
    }

    if (hasStrongStickerTexture && metrics.occupiedScore >= 0.42) {
        return {
            status: 'owned',
            confidence: normalize01(metrics.occupiedScore, 0.42, 0.82),
        };
    }

    if (hasRealStickerTexture && metrics.occupiedScore >= 0.52) {
        return {
            status: 'owned',
            confidence: normalize01(metrics.occupiedScore, 0.52, 0.86),
        };
    }

    return {
        status: 'uncertain',
        confidence: 0.5,
    };
}

function classifyHistorySlot(metrics: SlotMetrics): {
    status: ScannerDetectionStatus;
    confidence: number;
} {
    const hasPhotoTexture =
        metrics.centerContrast >= 44 ||
        metrics.centerEdgeScore >= 34 ||
        metrics.centerSaturation >= 0.32;

    const looksEmptyShield =
        metrics.centerWhiteRatio >= 0.38 &&
        metrics.centerContrast < 36 &&
        metrics.centerEdgeScore < 28;

    if (looksEmptyShield) {
        return {
            status: 'missing',
            confidence: normalize01(metrics.centerWhiteRatio, 0.38, 0.78),
        };
    }

    if (hasPhotoTexture && metrics.occupiedScore >= 0.4) {
        return {
            status: 'owned',
            confidence: normalize01(metrics.occupiedScore, 0.4, 0.82),
        };
    }

    if (metrics.occupiedScore >= 0.58 && metrics.centerContrast >= 38) {
        return {
            status: 'owned',
            confidence: normalize01(metrics.occupiedScore, 0.58, 0.88),
        };
    }

    return {
        status: 'uncertain',
        confidence: 0.5,
    };
}

function classifyIntroSlot(
    metrics: SlotMetrics,
    stickerId?: string,
): {
    status: ScannerDetectionStatus;
    confidence: number;
} {
    const isTrophyLike = stickerId === 'FWC1' || stickerId === 'FWC2' || stickerId === 'FWC5';

    const hasCentralObject =
        metrics.centerContrast >= 34 ||
        metrics.centerEdgeScore >= 25 ||
        metrics.centerSaturation >= 0.24;

    if (isTrophyLike && hasCentralObject && metrics.occupiedScore >= 0.28) {
        return {
            status: 'owned',
            confidence: normalize01(metrics.occupiedScore, 0.28, 0.76),
        };
    }

    if (
        metrics.centerWhiteRatio >= 0.56 &&
        metrics.centerContrast < 28 &&
        metrics.centerEdgeScore < 20
    ) {
        return {
            status: 'missing',
            confidence: normalize01(metrics.centerWhiteRatio, 0.56, 0.84),
        };
    }

    if (hasCentralObject && metrics.occupiedScore >= 0.36) {
        return {
            status: 'owned',
            confidence: normalize01(metrics.occupiedScore, 0.36, 0.8),
        };
    }

    return {
        status: 'uncertain',
        confidence: 0.5,
    };
}

function roundMetric(value: number): number {
    return Math.round(value * 1000) / 1000;
}

export async function analyzeTeamPageImage({
                                               imageFile,
                                               sectionId,
                                               layoutId,
                                               scanSlots,
                                               rotationDegrees,
                                               cropBox,
                                           }: AnalyzeTeamPageInput): Promise<TeamPageScanResult> {
    const image = await createImageFromFile(imageFile);
    const fullCanvas = drawImageToCanvas(image, rotationDegrees);
    const canvas = cropCanvas(fullCanvas, cropBox);

    const results: ScannerSlotResult[] = scanSlots.map((slot) => {
        const slotImageData = getSlotImageData(canvas, slot);
        const metrics = calculateSlotMetrics(slotImageData);
        const classification = classifySlot(
            metrics,
            slot.detectionProfile ?? 'team',
            slot.stickerId,
        );

        return {
            stickerId: slot.stickerId,
            detectedStatus: classification.status,
            confidence: roundMetric(classification.confidence),
            metrics: {
                brightness: roundMetric(metrics.brightness),
                contrast: roundMetric(metrics.contrast),
                saturation: roundMetric(metrics.saturation),
                edgeScore: roundMetric(metrics.edgeScore),
                whiteRatio: roundMetric(metrics.whiteRatio),
                centerWhiteRatio: roundMetric(metrics.centerWhiteRatio),
                centerSaturation: roundMetric(metrics.centerSaturation),
                centerContrast: roundMetric(metrics.centerContrast),
                centerEdgeScore: roundMetric(metrics.centerEdgeScore),
                occupiedScore: roundMetric(metrics.occupiedScore),
            },
        };
    });

    console.table(
        results.map((result) => ({
            stickerId: result.stickerId,
            status: result.detectedStatus,
            confidence: result.confidence,
            profile: scanSlots.find((slot) => slot.stickerId === result.stickerId)?.detectionProfile,
            occupiedScore: result.metrics?.occupiedScore,
            centerWhiteRatio: result.metrics?.centerWhiteRatio,
            centerSaturation: result.metrics?.centerSaturation,
            centerContrast: result.metrics?.centerContrast,
            centerEdgeScore: result.metrics?.centerEdgeScore,
            whiteRatio: result.metrics?.whiteRatio,
            brightness: result.metrics?.brightness,
            contrast: result.metrics?.contrast,
            saturation: result.metrics?.saturation,
            edgeScore: result.metrics?.edgeScore,
        })),
    );

    return {
        sectionId,
        layoutId,
        analyzedAt: new Date().toISOString(),
        imageName: imageFile.name,
        notes:
            'Análisis experimental con Canvas, recorte manual y perfiles por layout. Los resultados pueden requerir corrección manual.',
        results,
    };
}
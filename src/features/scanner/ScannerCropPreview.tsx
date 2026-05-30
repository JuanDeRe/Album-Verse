import { useEffect, useRef, useState } from 'react';
import type { ScannerCropBox } from '../../core/scanner/teamScanner.types';
import type { ScannerSlotLayout } from '../../core/scanner/teamScanner.types';

interface ScannerCropPreviewProps {
    imageUrl: string;
    rotationDegrees: number;
    cropBox: ScannerCropBox;
    scanSlots: ScannerSlotLayout[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function drawRotatedImageToCanvas(
    image: HTMLImageElement,
    rotationDegrees: number,
): HTMLCanvasElement {
    const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
    const swapsDimensions = normalizedRotation === 90 || normalizedRotation === 270;

    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;

    const rotatedWidth = swapsDimensions ? sourceHeight : sourceWidth;
    const rotatedHeight = swapsDimensions ? sourceWidth : sourceHeight;

    const canvas = document.createElement('canvas');
    canvas.width = rotatedWidth;
    canvas.height = rotatedHeight;

    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('No se pudo crear canvas.');
    }

    context.save();

    if (normalizedRotation === 90) {
        context.translate(canvas.width, 0);
        context.rotate(Math.PI / 2);
        context.drawImage(image, 0, 0);
    } else if (normalizedRotation === 180) {
        context.translate(canvas.width, canvas.height);
        context.rotate(Math.PI);
        context.drawImage(image, 0, 0);
    } else if (normalizedRotation === 270) {
        context.translate(0, canvas.height);
        context.rotate((3 * Math.PI) / 2);
        context.drawImage(image, 0, 0);
    } else {
        context.drawImage(image, 0, 0);
    }

    context.restore();

    return canvas;
}

function cropCanvas(
    sourceCanvas: HTMLCanvasElement,
    cropBox: ScannerCropBox,
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

    context.drawImage(
        sourceCanvas,
        sourceX,
        sourceY,
        safeW,
        safeH,
        0,
        0,
        safeW,
        safeH,
    );

    return outputCanvas;
}

export function ScannerCropPreview({
                                       imageUrl,
                                       rotationDegrees,
                                       cropBox,
                                       scanSlots,
                                   }: ScannerCropPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [previewSize, setPreviewSize] = useState({ width: 1, height: 1 });

    useEffect(() => {
        const image = new Image();

        image.onload = () => {
            const rotatedCanvas = drawRotatedImageToCanvas(image, rotationDegrees);
            const croppedCanvas = cropCanvas(rotatedCanvas, cropBox);

            const outputCanvas = canvasRef.current;

            if (!outputCanvas) return;

            outputCanvas.width = croppedCanvas.width;
            outputCanvas.height = croppedCanvas.height;

            const context = outputCanvas.getContext('2d');

            if (!context) return;

            context.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
            context.drawImage(croppedCanvas, 0, 0);

            setPreviewSize({
                width: croppedCanvas.width,
                height: croppedCanvas.height,
            });
        };

        image.src = imageUrl;
    }, [imageUrl, rotationDegrees, cropBox]);

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface-alt)',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    display: 'block',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                }}
            >
                {scanSlots.map((slot) => {
                    const stickerId = slot.stickerId;

                    return (
                        <div
                            key={slot.stickerId}
                            style={{
                                position: 'absolute',
                                left: `${slot.x * 100}%`,
                                top: `${slot.y * 100}%`,
                                width: `${slot.w * 100}%`,
                                height: `${slot.h * 100}%`,
                                border: '2px solid rgba(168, 85, 247, 0.9)',
                                background: 'rgba(168, 85, 247, 0.16)',
                                borderRadius: 8,
                                boxShadow: '0 0 0 1px rgba(255,255,255,0.45)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                padding: 3,
                                color: '#FFFFFF',
                                fontSize: 10,
                                fontWeight: 900,
                                textShadow: '0 1px 2px rgba(0,0,0,0.65)',
                            }}
                        >
                            {stickerId}
                        </div>
                    );
                })}
            </div>

            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'rgba(255,255,255,0.65)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    background: 'rgba(0,0,0,0.55)',
                    color: '#FFFFFF',
                    borderRadius: 999,
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 800,
                    pointerEvents: 'none',
                }}
            >
                {previewSize.width} × {previewSize.height}
            </div>
        </div>
    );
}
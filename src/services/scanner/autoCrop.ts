import type { ScannerCropBox } from '../../core/scanner/teamScanner.types';

interface SuggestCropBoxInput {
    imageFile: File;
    rotationDegrees: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function colorDistance(
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number,
): number {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2),
    );
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
    maxLongSide = 900,
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

function getAverageCornerColor(data: Uint8ClampedArray, width: number, height: number) {
    const sampleSize = Math.max(8, Math.round(Math.min(width, height) * 0.04));

    const samples: Array<[number, number]> = [];

    for (let y = 0; y < sampleSize; y += 2) {
        for (let x = 0; x < sampleSize; x += 2) {
            samples.push([x, y]);
            samples.push([width - 1 - x, y]);
            samples.push([x, height - 1 - y]);
            samples.push([width - 1 - x, height - 1 - y]);
        }
    }

    let r = 0;
    let g = 0;
    let b = 0;

    for (const [x, y] of samples) {
        const index = (y * width + x) * 4;

        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
    }

    const count = Math.max(1, samples.length);

    return {
        r: r / count,
        g: g / count,
        b: b / count,
    };
}

function smoothHits(values: number[], radius: number): number[] {
    return values.map((_, index) => {
        let sum = 0;
        let count = 0;

        for (let offset = -radius; offset <= radius; offset += 1) {
            const nextIndex = index + offset;

            if (nextIndex >= 0 && nextIndex < values.length) {
                sum += values[nextIndex];
                count += 1;
            }
        }

        return count === 0 ? 0 : sum / count;
    });
}

function findBounds(values: number[], threshold: number, step: number): [number, number] {
    let min = 0;
    let max = values.length - 1;

    for (let index = 0; index < values.length; index += step) {
        if (values[index] >= threshold) {
            min = index;
            break;
        }
    }

    for (let index = values.length - 1; index >= 0; index -= step) {
        if (values[index] >= threshold) {
            max = index;
            break;
        }
    }

    return [min, max];
}

export async function suggestCropBoxFromImage({
                                                  imageFile,
                                                  rotationDegrees,
                                              }: SuggestCropBoxInput): Promise<ScannerCropBox> {
    const image = await createImageFromFile(imageFile);
    const canvas = drawImageToCanvas(image, rotationDegrees);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('No se pudo leer la imagen.');
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;

    const background = getAverageCornerColor(data, width, height);

    const rowHits = new Array(height).fill(0);
    const colHits = new Array(width).fill(0);

    const step = Math.max(2, Math.round(Math.min(width, height) / 350));

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;

            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            const distance = colorDistance(r, g, b, background.r, background.g, background.b);
            const lum = luminance(r, g, b);

            /**
             * Detecta contenido que no se parece al fondo de las esquinas.
             * Se evita considerar sombras muy oscuras como contenido principal.
             */
            const isContentLike = distance > 42 && lum > 28;

            if (isContentLike) {
                rowHits[y] += 1;
                colHits[x] += 1;
            }
        }
    }

    const smoothedRowHits = smoothHits(rowHits, Math.max(2, Math.round(height * 0.006)));
    const smoothedColHits = smoothHits(colHits, Math.max(2, Math.round(width * 0.006)));

    const rowThreshold = Math.max(4, Math.round((width / step) * 0.1));
    const colThreshold = Math.max(4, Math.round((height / step) * 0.1));

    let [minY, maxY] = findBounds(smoothedRowHits, rowThreshold, step);
    let [minX, maxX] = findBounds(smoothedColHits, colThreshold, step);

    const paddingX = width * 0.015;
    const paddingY = height * 0.015;

    minX = clamp(minX - paddingX, 0, width - 20);
    maxX = clamp(maxX + paddingX, minX + 20, width);
    minY = clamp(minY - paddingY, 0, height - 20);
    maxY = clamp(maxY + paddingY, minY + 20, height);

    const left = minX / width;
    const top = minY / height;
    const right = 1 - maxX / width;
    const bottom = 1 - maxY / height;

    return {
        left: clamp(left, 0, 0.25),
        top: clamp(top, 0, 0.25),
        right: clamp(right, 0, 0.25),
        bottom: clamp(bottom, 0, 0.25),
    };
}
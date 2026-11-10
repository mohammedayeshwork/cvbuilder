import type { Area } from 'react-easy-crop';

/** Decoded image bytes allowed in content; mirrors DocumentValidator::MAX_PHOTO_BYTES. */
export const MAX_PHOTO_BYTES = 200 * 1024;
const SIZE = 400;

export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () =>
            reject(new Error('This file could not be read as an image.'));
        image.src = src;
    });
}

const bytesOf = (dataUri: string) =>
    Math.floor(((dataUri.length - dataUri.indexOf(',') - 1) * 3) / 4);

/**
 * Crop to a 400×400 square and encode as WebP (JPEG where the browser
 * cannot encode WebP), lowering quality until it fits MAX_PHOTO_BYTES.
 */
export async function cropToDataUri(src: string, area: Area): Promise<string> {
    const image = await loadImage(src);
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const context = canvas.getContext('2d')!;
    context.imageSmoothingQuality = 'high';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, SIZE, SIZE);
    context.drawImage(
        image,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        SIZE,
        SIZE,
    );

    const webp = canvas
        .toDataURL('image/webp', 0.9)
        .startsWith('data:image/webp');
    const type = webp ? 'image/webp' : 'image/jpeg';

    for (let quality = 0.9; quality >= 0.3; quality -= 0.1) {
        const uri = canvas.toDataURL(type, quality);
        if (bytesOf(uri) <= MAX_PHOTO_BYTES) {
            return uri;
        }
    }

    throw new Error(
        'The photo is too detailed to store. Try a different picture.',
    );
}

/**
 * Compress an image file client-side using canvas.
 * Resizes to maxDimension and re-encodes at the given quality,
 * iterating down quality until under targetSize (bytes).
 */
export async function compressImage(
  file: File,
  options: {
    maxDimension?: number;
    targetSize?: number;
    initialQuality?: number;
    minQuality?: number;
  } = {}
): Promise<File> {
  const {
    maxDimension = 1600,
    targetSize = 900 * 1024,
    initialQuality = 0.85,
    minQuality = 0.5,
  } = options;

  const isPng = file.type === "image/png";
  const isWebp = file.type === "image/webp";
  const outputType = isPng ? "image/jpeg" : isWebp ? "image/webp" : file.type;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxDimension || height > maxDimension) {
    const ratio = width > height ? maxDimension / width : maxDimension / height;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = initialQuality;
  let blob: Blob | null = null;

  while (quality >= minQuality) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, quality)
    );
    if (blob && blob.size <= targetSize) break;
    quality -= 0.1;
  }

  if (!blob) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outputType, minQuality)
    );
  }

  if (!blob) return file;

  const ext = outputType === "image/webp" ? "webp" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.${ext}`, { type: outputType });
}
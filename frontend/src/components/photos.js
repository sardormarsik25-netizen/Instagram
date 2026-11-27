export const maxPhotoBytes = 10 * 1024 * 1024;

export async function preparePhoto(file, { size, square = false }) {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const crop = Math.min(bitmap.width, bitmap.height);
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    canvas.width = square ? size : Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = square ? size : Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (square) {
      context.drawImage(bitmap, (bitmap.width - crop) / 2, (bitmap.height - crop) / 2,
        crop, crop, 0, 0, size, size);
    } else {
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', 0.86);
  } finally {
    bitmap.close();
  }
}

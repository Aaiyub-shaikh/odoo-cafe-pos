export const MAX_PRODUCT_IMAGE_BYTES = 2 * 1024 * 1024

export function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WebP, etc.)')
  }
  if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error('Image must be smaller than 2 MB')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

/** Keep existing image on edit when the field is left unchanged. */
export function resolveProductImage(
  value: string | undefined,
  existingImage: string | undefined,
  isEditing: boolean
): string | undefined {
  const trimmed = value?.trim()
  if (trimmed) return trimmed
  if (isEditing && existingImage?.trim()) return existingImage.trim()
  return undefined
}

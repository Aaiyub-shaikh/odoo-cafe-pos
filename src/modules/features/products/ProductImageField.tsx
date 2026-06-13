import { useRef } from 'react'
import { ImagePlus, Link2, Package, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { readImageFile } from '@/utils/productImage'

interface ProductImageFieldProps {
  productName: string
  value: string
  onChange: (value: string) => void
  existingImage?: string
}

export function ProductImageField({ productName, value, onChange, existingImage }: ProductImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const preview = value.trim() || existingImage?.trim() || ''

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const dataUrl = await readImageFile(file)
      onChange(dataUrl)
      toast.success('Image uploaded from device')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      e.target.value = ''
    }
  }

  const handleRemove = () => {
    onChange('')
  }

  return (
    <div className="space-y-3">
      <Label>Product Image</Label>

      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
          {preview ? (
            <img
              src={preview}
              alt={productName || 'Product preview'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
              <Package className="h-6 w-6" />
              <span className="text-[10px]">No image</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" />
              Image URL
            </div>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-secondary/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload from device
            </Button>

            {existingImage && !value.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => onChange(existingImage)}
              >
                <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
                Use saved image
              </Button>
            )}

            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleRemove}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Paste a URL or upload JPG/PNG/WebP from your device (max 2 MB).
            {existingImage && ' The current product image is kept when you save without changing it.'}
          </p>
        </div>
      </div>
    </div>
  )
}

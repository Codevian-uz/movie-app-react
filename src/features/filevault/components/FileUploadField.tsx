import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import type { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getFileUrl, getStreamUrl, uploadFile, useAuthenticatedFile } from '../api/filevault.api'

interface FileUploadFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  form: UseFormReturn<T>
  type?: 'video' | 'image'
  aspect?: 'video' | 'square' | 'poster'
  className?: string
}

export function FileUploadField<T extends FieldValues>({
  name,
  label,
  form,
  type = 'image',
  aspect = 'video',
  className,
}: FileUploadFieldProps<T>) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const value = form.watch(name) as string | undefined | null

  const shouldFetch =
    value !== '' &&
    value !== undefined &&
    value !== null &&
    localPreview === null &&
    type !== 'video' &&
    !value.startsWith('blob:')
  const { objectUrl, isLoading: isFetching } = useAuthenticatedFile(shouldFetch ? value : null)

  const displayUrl = localPreview ?? (type === 'video' ? value : objectUrl)

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    poster: 'aspect-[2/3]',
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file === undefined) {
      return
    }

    const localUrl = URL.createObjectURL(file)
    setLocalPreview(localUrl)

    setIsUploading(true)
    setUploadProgress(0)
    try {
      const res = await uploadFile(file, (progress) => {
        setUploadProgress(progress)
      })
      const url = type === 'video' ? getStreamUrl(res.id) : getFileUrl(res.id)
      form.setValue(name, url as PathValue<T, Path<T>>)
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
      setLocalPreview(null)
      URL.revokeObjectURL(localUrl)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {value !== undefined && value !== '' && value !== null ? (
          <div
            className={cn(
              'bg-muted relative w-full overflow-hidden rounded-md border',
              aspectClasses[aspect],
              aspect === 'square' && 'max-w-32',
              aspect === 'poster' && 'max-w-40',
            )}
          >
            {isFetching ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-4 animate-spin" />
              </div>
            ) : type === 'video' ? (
              displayUrl !== null && displayUrl !== '' ? (
                <video
                  src={displayUrl}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  crossOrigin="use-credentials"
                />
              ) : null
            ) : displayUrl !== null && displayUrl !== '' ? (
              <img src={displayUrl} alt={label} className="h-full w-full object-cover" />
            ) : null}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 z-10 size-6"
              onClick={() => {
                form.setValue(name, '' as PathValue<T, Path<T>>)
                if (localPreview !== null) {
                  URL.revokeObjectURL(localPreview)
                  setLocalPreview(null)
                }
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-24 w-full border-dashed',
                aspect === 'square' && 'h-32 w-32',
                aspect === 'poster' && 'h-48 w-32',
              )}
              disabled={isUploading}
              onClick={() => {
                inputRef.current?.click()
              }}
            >
              {isUploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="size-6" />
                  <span className="text-xs">Upload</span>
                </div>
              )}
            </Button>
            {isUploading && (
              <div className="w-full space-y-1">
                <Progress value={uploadProgress} className="h-1" />
                <p className="text-muted-foreground text-right text-[10px] font-medium">
                  {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        )}
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            void handleFileChange(e)
          }}
          accept={type === 'video' ? 'video/*' : 'image/*'}
        />
      </div>
    </div>
  )
}

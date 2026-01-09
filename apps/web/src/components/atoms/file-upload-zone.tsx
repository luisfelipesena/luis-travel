import { cn } from "@/lib/utils"
import { ImagePlus, Loader2, X } from "lucide-react"
import { useCallback, useState } from "react"

interface FileUploadZoneProps {
  value?: string | null
  onUpload: (file: File) => Promise<string>
  onRemove?: () => void
  accept?: string
  maxSize?: number
  disabled?: boolean
  className?: string
}

export function FileUploadZone({
  value,
  onUpload,
  onRemove,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  disabled = false,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) await handleFile(file)
    },
    [disabled]
  )

  const handleFile = async (file: File) => {
    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione uma imagem")
      return
    }

    if (file.size > maxSize) {
      setError(`A imagem deve ter no máximo ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setIsUploading(true)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar imagem")
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleFile(file)
    e.target.value = ""
  }

  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <img
          src={value}
          alt="Capa da viagem"
          className="w-full h-40 object-cover rounded-xl border"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full",
              "bg-background/80 text-destructive backdrop-blur-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-destructive hover:text-destructive-foreground"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-6",
          "border-2 border-dashed rounded-xl cursor-pointer",
          "transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            <span className="text-sm text-muted-foreground">Enviando...</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <span className="text-sm font-medium text-foreground">
                {isDragging ? "Solte aqui" : "Adicionar imagem de capa"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG ou WebP (máx. 5MB)
              </p>
            </div>
          </>
        )}
      </label>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  )
}

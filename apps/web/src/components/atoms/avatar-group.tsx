import { cn } from "@/lib/utils"

interface AvatarGroupProps {
  images?: string[]
  max?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
}

const defaultAvatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=d1d4f9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=ffd5dc",
]

export function AvatarGroup({
  images = defaultAvatars,
  max = 4,
  size = "md",
  className
}: AvatarGroupProps) {
  const visibleImages = images.slice(0, max)
  const remaining = images.length - max

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleImages.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          className={cn(
            sizeClasses[size],
            "rounded-full border-2 border-background object-cover ring-0",
            "transition-transform hover:scale-110 hover:z-10"
          )}
          style={{ zIndex: visibleImages.length - index }}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center rounded-full",
            "bg-muted border-2 border-background text-xs font-medium text-muted-foreground"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

import { AvatarGroup } from "@/components/atoms"
import { cn } from "@/lib/utils"

interface SocialProofBadgeProps {
  count: number
  label: string
  avatars?: string[]
  className?: string
}

export function SocialProofBadge({
  count,
  label,
  avatars,
  className,
}: SocialProofBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 px-4 py-2",
        "rounded-full border bg-background/80 backdrop-blur-sm shadow-sm",
        className
      )}
    >
      <AvatarGroup images={avatars} size="sm" max={4} />
      <span className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">+{count}</span> {label}
      </span>
    </div>
  )
}

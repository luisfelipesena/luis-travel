import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface BenefitCardProps {
  icon: LucideIcon
  title: string
  description: string
  highlight?: string
  className?: string
  style?: React.CSSProperties
}

export function BenefitCard({
  icon: Icon,
  title,
  description,
  highlight,
  className,
  style,
}: BenefitCardProps) {
  return (
    <div
      style={style}
      className={cn(
        "relative flex flex-col p-6 rounded-2xl",
        "bg-gradient-to-br from-muted/50 to-background border",
        "transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {highlight && (
            <p className="text-sm font-medium text-primary mt-2">{highlight}</p>
          )}
        </div>
      </div>
    </div>
  )
}

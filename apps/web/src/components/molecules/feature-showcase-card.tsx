import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureShowcaseCardProps {
  icon: LucideIcon
  title: string
  description: string
  accent?: "primary" | "secondary" | "orange"
  className?: string
  style?: React.CSSProperties
}

const accentClasses = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  secondary: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white",
  orange: "bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white",
}

export function FeatureShowcaseCard({
  icon: Icon,
  title,
  description,
  accent = "primary",
  className,
  style,
}: FeatureShowcaseCardProps) {
  return (
    <div
      style={style}
      className={cn(
        "group relative flex flex-col items-center text-center p-8 rounded-2xl",
        "bg-background border shadow-sm",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      <div
        className={cn(
          "mb-5 flex h-14 w-14 items-center justify-center rounded-xl",
          "transition-colors duration-300",
          accentClasses[accent]
        )}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

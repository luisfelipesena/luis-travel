import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, Clock, Loader2, MapPin, Sparkles } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ACTIVITY_COLORS, type AIActivityCategory } from "@/types"

export interface AISuggestion {
  title: string
  description: string
  suggestedStartTime: string
  durationMinutes: number
  location: string
  locationLat: number
  locationLng: number
  category: AIActivityCategory
  day: number
}

interface AISuggestionsDialogProps {
  open: boolean
  onClose: () => void
  onGenerate: (preferences?: string) => Promise<AISuggestion[]>
  onAddSuggestions: (suggestions: AISuggestion[]) => Promise<void>
  isGenerating?: boolean
  isAdding?: boolean
}

const CATEGORY_LABELS: Record<AIActivityCategory, string> = {
  attraction: "Atração",
  restaurant: "Restaurante",
  activity: "Atividade",
  transport: "Transporte",
}

export function AISuggestionsDialog({
  open,
  onClose,
  onGenerate,
  onAddSuggestions,
  isGenerating = false,
  isAdding = false,
}: AISuggestionsDialogProps) {
  const [preferences, setPreferences] = useState("")
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async () => {
    const result = await onGenerate(preferences || undefined)
    setSuggestions(result)
    setSelectedIndices(new Set(result.map((_, i) => i)))
    setHasGenerated(true)
  }

  const handleAddSelected = async () => {
    const selected = suggestions.filter((_, i) => selectedIndices.has(i))
    await onAddSuggestions(selected)
    handleClose()
  }

  const handleClose = () => {
    setSuggestions([])
    setSelectedIndices(new Set())
    setHasGenerated(false)
    setPreferences("")
    onClose()
  }

  const toggleSelection = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIndices.size === suggestions.length) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(suggestions.map((_, i) => i)))
    }
  }

  // Group suggestions by day
  const suggestionsByDay = suggestions.reduce(
    (acc, s, i) => {
      const day = s.day || 1
      if (!acc[day]) acc[day] = []
      acc[day].push({ suggestion: s, index: i })
      return acc
    },
    {} as Record<number, { suggestion: AISuggestion; index: number }[]>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Sugestões de IA
          </DialogTitle>
          <DialogDescription>
            Gere sugestões de atividades baseadas no seu destino
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          {!hasGenerated ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferences">Preferências (opcional)</Label>
                <Input
                  id="preferences"
                  placeholder="Ex: museus, gastronomia local, passeios ao ar livre..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Descreva seus interesses para sugestões mais personalizadas
                </p>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando sugestões...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Sugestões
                  </>
                )}
              </Button>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Nenhuma sugestão gerada</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIndices.size === suggestions.length}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedIndices.size} de {suggestions.length} selecionadas
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Regenerar"}
                </Button>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {Object.entries(suggestionsByDay)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([day, items]) => (
                      <div key={day}>
                        <h4 className="mb-2 font-semibold text-muted-foreground">Dia {day}</h4>
                        <div className="space-y-2">
                          {items.map(({ suggestion, index }) => (
                            <SuggestionCard
                              key={index}
                              suggestion={suggestion}
                              selected={selectedIndices.has(index)}
                              onToggle={() => toggleSelection(index)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {hasGenerated && suggestions.length > 0 && (
            <Button onClick={handleAddSelected} disabled={selectedIndices.size === 0 || isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Adicionar {selectedIndices.size} atividade{selectedIndices.size !== 1 && "s"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface SuggestionCardProps {
  suggestion: AISuggestion
  selected: boolean
  onToggle: () => void
}

function SuggestionCard({ suggestion, selected, onToggle }: SuggestionCardProps) {
  const categoryColor = ACTIVITY_COLORS[suggestion.category] || "#3b82f6"

  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border p-3 transition-colors",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggle()}
    >
      <div className="flex gap-3">
        <Checkbox checked={selected} className="mt-1" />
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-medium leading-tight">{suggestion.title}</h5>
            <Badge
              variant="secondary"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {CATEGORY_LABELS[suggestion.category]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(suggestion.suggestedStartTime), "HH:mm", { locale: ptBR })}
              {" - "}
              {suggestion.durationMinutes}min
            </span>
            {suggestion.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {suggestion.location.split(",")[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { Check, Loader2, MapPin, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

export interface CitySelection {
  name: string
  displayName: string
  lat: number
  lng: number
  country?: string
  countryCode?: string
}

interface CitySearchComboboxProps {
  value?: CitySelection | null
  onChange: (city: CitySelection | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CitySearchCombobox({
  value,
  onChange,
  placeholder = "Buscar cidade...",
  disabled = false,
  className,
}: CitySearchComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { data: cities, isLoading } = trpc.geo.searchCities.useQuery(
    { query: debouncedQuery, limit: 8 },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 1000 * 60 * 5,
    }
  )

  const handleSelect = (city: NonNullable<typeof cities>[number]) => {
    onChange({
      name: city.name,
      displayName: city.displayName,
      lat: city.lat,
      lng: city.lng,
      country: city.country,
      countryCode: city.countryCode,
    })
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearchQuery("")
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (!open) setOpen(true)
  }

  const handleFocus = () => {
    setOpen(true)
  }

  const handleClick = () => {
    if (value) {
      // If a value is selected, clear it and let user search again
      onChange(null)
      setSearchQuery("")
      setOpen(true)
      inputRef.current?.focus()
    } else {
      setOpen(true)
    }
  }

  const displayValue = value ? `${value.name}${value.country ? `, ${value.country}` : ""}` : ""
  const showDropdown = open && (searchQuery.length >= 2 || isLoading)
  const hasResults = cities && cities.length > 0

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value ? displayValue : searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleClick}
          disabled={disabled}
          className={cn("pl-9 pr-8 cursor-pointer", value && "text-foreground")}
          readOnly={!!value}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar seleção"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {isLoading && (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          )}

          {!isLoading && !hasResults && debouncedQuery.length >= 2 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">Nenhuma cidade encontrada</div>
          )}

          {hasResults && (
            <ul className="max-h-60 overflow-auto py-1">
              {cities.map((city) => {
                const isSelected = value?.lat === city.lat && value?.lng === city.lng
                return (
                  <li key={city.placeId}>
                    <button
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent",
                        isSelected && "bg-accent"
                      )}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium truncate">{city.name}</span>
                          {city.countryCode && (
                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {city.countryCode}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{city.displayName}</p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

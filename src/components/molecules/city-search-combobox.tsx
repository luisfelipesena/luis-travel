import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: cities, isLoading } = trpc.geo.searchCities.useQuery(
    { query: debouncedQuery, limit: 8 },
    {
      enabled: debouncedQuery.length >= 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
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

  const handleClear = () => {
    onChange(null)
    setSearchQuery("")
  }

  const displayValue = value ? `${value.name}${value.country ? `, ${value.country}` : ""}` : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{displayValue || placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite o nome da cidade..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando cidades...
              </div>
            )}

            {!isLoading && debouncedQuery.length >= 2 && cities?.length === 0 && (
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            )}

            {!isLoading && debouncedQuery.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </div>
            )}

            {cities && cities.length > 0 && (
              <CommandGroup heading="Cidades">
                {cities.map((city) => (
                  <CommandItem
                    key={city.placeId}
                    value={String(city.placeId)}
                    onSelect={() => handleSelect(city)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {city.name}
                        {city.countryCode && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {city.countryCode}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {city.displayName}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value?.lat === city.lat && value?.lng === city.lng
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>

        {value && (
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" className="w-full" onClick={handleClear}>
              Limpar seleção
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

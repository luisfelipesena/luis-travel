import { formatDestinations } from "@luis-travel/types"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, CalendarIcon } from "lucide-react"
import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { type Destination, DestinationList } from "@/components/trip/destination-list"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { trpc } from "@/lib/trpc"
import { cn } from "@/lib/utils"

/** Generate destination image URL using Lorem Picsum */
function getDestinationImageUrl(cityName: string, country?: string): string {
  const seed = [cityName, country]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`
}

export const Route = createFileRoute("/_authenticated/dashboard/trips/new")({
  component: NewTripPage,
})

function NewTripPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([
    { name: "", displayName: "", lat: 0, lng: 0, order: 0 },
  ])
  const [description, setDescription] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const createTrip = trpc.trip.create.useMutation({
    onSuccess: (trip) => {
      toast.success("Viagem criada com sucesso!")
      navigate({ to: `/dashboard/trips/${trip.id}` })
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar viagem")
    },
  })

  // Get valid destinations for submission
  const validDestinations = destinations.filter((d) => d.name && d.lat !== 0 && d.lng !== 0)

  // Get primary destination name for backward compatibility
  const primaryDestination =
    validDestinations.length > 0 ? formatDestinations(validDestinations, "comma") : ""

  // Auto-generate cover image from first valid destination
  const coverImage = useMemo(() => {
    const firstDestination = validDestinations[0]
    if (!firstDestination) return undefined
    return getDestinationImageUrl(firstDestination.name, firstDestination.country)
  }, [validDestinations])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || validDestinations.length === 0 || !dateRange?.from || !dateRange?.to) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (dateRange.from >= dateRange.to) {
      toast.error("A data de término deve ser após a data de início")
      return
    }

    createTrip.mutate({
      name,
      destination: primaryDestination,
      destinations: validDestinations.map((d, index) => ({
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        order: index,
        country: d.country,
        countryCode: d.countryCode,
      })),
      description: description || undefined,
      startDate: dateRange.from,
      endDate: dateRange.to,
      coverImage,
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/trips">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Nova Viagem</h1>
          <p className="text-muted-foreground">Comece a planejar sua próxima aventura</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Viagem</CardTitle>
          <CardDescription>Insira as informações básicas sobre sua viagem</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Viagem *</Label>
              <Input
                id="name"
                placeholder="Férias de Verão 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Destinos *</Label>
              <p className="text-sm text-muted-foreground">
                Adicione uma ou mais cidades para sua viagem. Arraste para reordenar.
              </p>
              <DestinationList
                destinations={destinations}
                onChange={setDestinations}
                maxDestinations={10}
                showMap={true}
              />
            </div>

            {/* Destination Preview Image - shows when destination is selected */}
            {coverImage && (
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={coverImage}
                  alt={`Preview de ${primaryDestination}`}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white text-sm font-medium">
                  {primaryDestination}
                </div>
              </div>
            )}

            {/* Date Range Picker - single picker for both dates */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Datas da Viagem *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
                      )
                    ) : (
                      "Selecione as datas da viagem"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Adicione notas sobre sua viagem..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/dashboard/trips" })}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createTrip.isPending}>
                {createTrip.isPending ? "Criando..." : "Criar Viagem"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

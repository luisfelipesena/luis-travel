import { formatDestinations } from "@luis-travel/types"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, CalendarIcon } from "lucide-react"
import { useMemo, useState } from "react"
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

export const Route = createFileRoute("/_authenticated/dashboard/trips/new")({
  component: NewTripPage,
})

/**
 * Generate destination image URL using Unsplash Source
 */
function getDestinationImageUrl(cityName: string, country?: string): string {
  const searchTerms = [cityName, country, "travel", "landmark", "tourism"]
    .filter(Boolean)
    .map((term) => encodeURIComponent(term!.toLowerCase()))
    .join(",")

  return `https://source.unsplash.com/featured/800x600/?${searchTerms}`
}

function NewTripPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([
    { name: "", displayName: "", lat: 0, lng: 0, order: 0 },
  ])
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

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

    if (!name || validDestinations.length === 0 || !startDate || !endDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (startDate >= endDate) {
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
      startDate,
      endDate,
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "d 'de' MMMM, yyyy", { locale: ptBR })
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data de Término *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "d 'de' MMMM, yyyy", { locale: ptBR })
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        date < new Date() || Boolean(startDate && date <= startDate)
                      }
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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

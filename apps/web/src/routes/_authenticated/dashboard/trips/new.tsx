import { formatDestinations } from "@luis-travel/types"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, CalendarIcon, ImagePlus, X } from "lucide-react"
import { useRef, useState } from "react"
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

function NewTripPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [destinations, setDestinations] = useState<Destination[]>([
    { name: "", displayName: "", lat: 0, lng: 0, order: 0 },
  ])
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [coverImage, setCoverImage] = useState<string>()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao fazer upload")
      }

      const data = await response.json()
      setCoverImage(data.url)
      toast.success("Imagem carregada com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
    }
  }

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

            <div className="space-y-2">
              <Label>Imagem de Capa</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {coverImage ? (
                <div className="relative">
                  <img
                    src={coverImage}
                    alt="Capa da viagem"
                    className="h-48 w-full rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => setCoverImage(undefined)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-48 w-full border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="h-8 w-8" />
                    <span>{isUploading ? "Carregando..." : "Adicionar imagem de capa"}</span>
                    <span className="text-xs">PNG, JPG ou WebP (máx. 5MB)</span>
                  </div>
                </Button>
              )}
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

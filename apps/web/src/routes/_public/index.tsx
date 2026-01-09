import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Calendar,
  Check,
  Globe,
  MapPin,
  Route as RouteIcon,
  Sparkles,
  Users,
} from "lucide-react"
import { EnhancedTripForm } from "@/components/landing"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
})

const features = [
  {
    icon: Calendar,
    title: "Calendário Visual",
    description: "Organize suas atividades com drag and drop intuitivo",
  },
  {
    icon: Sparkles,
    title: "Sugestões com IA",
    description: "Recomendações personalizadas para seu destino",
  },
  {
    icon: Users,
    title: "Colaboração",
    description: "Planeje junto com amigos e família em tempo real",
  },
  {
    icon: RouteIcon,
    title: "Rotas Otimizadas",
    description: "Visualize trajetos e economize tempo nos passeios",
  },
  {
    icon: Globe,
    title: "Multi-destino",
    description: "Planeje viagens com várias cidades em um só lugar",
  },
  {
    icon: MapPin,
    title: "Pontos de Interesse",
    description: "Descubra atrações próximas às suas atividades",
  },
]

const stats = [
  { value: "100+", label: "Viajantes" },
  { value: "500+", label: "Viagens planejadas" },
  { value: "4.9", label: "Avaliação média" },
]

const benefits = [
  "Planeje viagens em minutos",
  "Visualize tudo no calendário",
  "Compartilhe com sua galera",
  "Acesse de qualquer dispositivo",
  "Sugestões inteligentes de atividades",
]

function LandingPage() {
  const { isAuthenticated } = Route.useRouteContext()

  return (
    <>
      {/* Hero Section - Dark Theme */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          {/* Globe-like gradient effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-3xl animate-pulse" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />
          </div>
          {/* Grid lines effect */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Floating dots */}
          <div className="absolute top-20 left-[15%] w-2 h-2 bg-primary/60 rounded-full" />
          <div className="absolute top-40 right-[20%] w-1.5 h-1.5 bg-primary/40 rounded-full" />
          <div className="absolute bottom-32 left-[25%] w-2 h-2 bg-primary/50 rounded-full" />
          <div className="absolute top-[60%] right-[30%] w-1 h-1 bg-primary/30 rounded-full" />
        </div>

        <div className="container relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8 text-white">
              {/* Stats badge */}
              <div className="inline-flex items-center gap-6 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{stat.value}</span>
                    <span className="text-sm text-gray-400">{stat.label}</span>
                    {i < stats.length - 1 && <div className="w-px h-4 bg-white/10 ml-4" />}
                  </div>
                ))}
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Planeje sua viagem
                  <br />
                  <span className="text-primary">
                    de qualquer lugar
                  </span>
                </h1>
                <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                  Crie roteiros detalhados, acompanhe voos e colabore com amigos. Nossa IA sugere as
                  melhores atividades para seu destino.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  "Calendário visual",
                  "Colaboração real-time",
                  "Sugestões com IA",
                  "Rotas otimizadas",
                  "Multi-destino",
                  "100% gratuito",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Mobile CTA */}
              <div className="lg:hidden">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8"
                  onClick={() =>
                    document.getElementById("trip-form")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right side - Form */}
            <div id="trip-form" className="lg:pl-8">
              <EnhancedTripForm isAuthenticated={isAuthenticated} variant="dark" />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-6">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Tudo para planejar sua aventura</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 sm:text-4xl">Ferramentas Poderosas</h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa para criar o roteiro perfeito
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold sm:text-4xl">Por que Luis Travel?</h2>
                <p className="text-muted-foreground text-lg">
                  Simplificamos o planejamento para você aproveitar mais a viagem.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-4"
                    style={{ animationDelay: `${i * 75}ms` }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
              <div className="relative rounded-2xl border bg-gradient-to-br from-background to-muted/50 p-8 lg:p-12 shadow-xl">
                <div className="space-y-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center">
                    <img src="/luis-travel-icon.svg" alt="Luis Travel" className="h-20 w-20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Comece grátis</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Crie sua conta e comece a planejar agora mesmo. Sem cartão de crédito
                      necessário.
                    </p>
                  </div>
                  {isAuthenticated ? (
                    <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg" asChild>
                      <Link to="/dashboard">Ir para o Painel</Link>
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg" asChild>
                      <a href="/auth/sign-up">Criar Conta Grátis</a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// Internal feature card component
interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  index: number
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl",
        "bg-background border shadow-sm",
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Calendar,
  Check,
  Globe,
  MapPin,
  Plane,
  Sparkles,
  Users,
} from "lucide-react"
import { SocialProofBadge, FeatureShowcaseCard, BenefitCard } from "@/components/molecules"
import { EnhancedTripForm } from "@/components/landing"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
})

const features = [
  {
    icon: Calendar,
    title: "Calendário Intuitivo",
    description: "Organize suas atividades visualmente com drag and drop",
    accent: "primary" as const,
  },
  {
    icon: Sparkles,
    title: "Sugestões com IA",
    description: "Recomendações personalizadas de restaurantes e atrações",
    accent: "orange" as const,
  },
  {
    icon: Users,
    title: "Colaboração Real-time",
    description: "Planeje junto com amigos e família em tempo real",
    accent: "secondary" as const,
  },
]

const audiences = [
  {
    icon: Plane,
    title: "Viajantes Frequentes",
    description: "Organize múltiplas viagens e mantenha tudo sincronizado",
    highlight: "Tudo em um só lugar",
  },
  {
    icon: Users,
    title: "Grupos & Famílias",
    description: "Convide pessoas e colabore no planejamento juntos",
    highlight: "Todos na mesma página",
  },
  {
    icon: Globe,
    title: "Exploradores",
    description: "Descubra novos destinos e atividades com sugestões IA",
    highlight: "Aventuras personalizadas",
  },
]

const benefits = [
  "Planeje viagens em minutos, não em horas",
  "Visualize todas as atividades no calendário",
  "Compartilhe com quem for viajar com você",
  "Acesse de qualquer dispositivo",
  "Sugestões inteligentes de atividades",
]

function LandingPage() {
  const { isAuthenticated } = Route.useRouteContext()

  const scrollToForm = () => {
    document.getElementById("trip-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_50%_50%_at_100%_0%,hsl(var(--primary)/0.08),transparent)]" />
        </div>

        <div className="container py-12 md:py-20 lg:py-28">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Social proof */}
            <SocialProofBadge
              count={100}
              label="viajantes felizes"
              className="animate-fade-in"
            />

            {/* Main headline */}
            <div className="space-y-4 max-w-4xl animate-fade-in" style={{ animationDelay: "100ms" }}>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Planeje sua Viagem{" "}
                <span className="inline-flex items-center">
                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl">✈️</span>
                </span>{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Em Segundos
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                Crie roteiros detalhados, acompanhe voos e colabore com amigos.
                Nossa IA sugere as melhores atividades para seu destino.
              </p>
            </div>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <Button
                size="lg"
                onClick={scrollToForm}
                className="px-8 h-12 text-base font-semibold shadow-lg shadow-primary/25"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Ver como funciona
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="trip-form" className="relative py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-xl">
            <EnhancedTripForm isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative border-y bg-muted/30">
        {/* Grid background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="container py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm mb-6">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Tudo para planejar sua aventura</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 sm:text-4xl">
              Ferramentas Poderosas
            </h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa para criar o roteiro perfeito
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <FeatureShowcaseCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                accent={feature.accent}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dark Gradient Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Não é só uma ferramenta.
              <br />
              <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                É a sua viagem perfeita.
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Se você está planejando sua próxima aventura mas se perde em planilhas
              e abas do navegador — o Luis Travel foi feito para você.
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                variant="secondary"
                className="mt-4 px-8"
                asChild
              >
                <Link to="/dashboard">Ir para o Painel</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                className="mt-4 px-8"
                onClick={scrollToForm}
              >
                Começar Agora — É Grátis
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Who is it for Section */}
      <section className="container py-20 lg:py-28">
        <div className="space-y-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>Para quem é?</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Planejamento de Viagens
                  <br />
                  <span className="text-muted-foreground">para todos os perfis</span>
                </h2>
              </div>
              <p className="text-lg text-muted-foreground">
                Se você está planejando uma escapada rápida ou uma viagem de meses,
                se viaja sozinho ou com um grupo — temos as ferramentas certas.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((audience, i) => (
              <BenefitCard
                key={audience.title}
                icon={audience.icon}
                title={audience.title}
                description={audience.description}
                highlight={audience.highlight}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & CTA Section */}
      <section className="container py-20 lg:py-28">
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
                  className="flex items-center gap-4 animate-fade-in"
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
      </section>
    </>
  )
}

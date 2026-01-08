import { createFileRoute, Link } from "@tanstack/react-router"
import { Calendar, Check, MapPin, Plane, Sparkles, Users } from "lucide-react"
import { HeroTripForm } from "@/components/landing"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
})

const steps = [
  { number: "1", title: "Escolha o destino", description: "Digite para onde você quer ir" },
  { number: "2", title: "Defina as datas", description: "Selecione quando será sua viagem" },
  { number: "3", title: "Monte o roteiro", description: "Adicione atividades ao calendário" },
]

const features = [
  {
    icon: Calendar,
    title: "Calendário Visual",
    description: "Arraste e solte atividades no calendário para montar seu roteiro perfeito",
  },
  {
    icon: Plane,
    title: "Rastreamento de Voos",
    description: "Acompanhe seus voos com status em tempo real e atualizações",
  },
  {
    icon: Users,
    title: "Colaboração",
    description: "Convide amigos para editar e visualizar sua viagem juntos",
  },
  {
    icon: Sparkles,
    title: "Sugestões com IA",
    description: "Receba recomendações personalizadas de atividades e lugares",
  },
]

const benefits = [
  "Planeje viagens em minutos, não em horas",
  "Todas as informações em um só lugar",
  "Compartilhe com quem for viajar com você",
  "Acesse de qualquer dispositivo",
  "Sugestões inteligentes de atividades",
]

function LandingPage() {
  const { isAuthenticated } = Route.useRouteContext()

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />

        <div className="container py-16 md:py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Planejamento de viagens simplificado</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Planeje sua viagem{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    em segundos
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Crie roteiros detalhados, acompanhe voos e colabore com amigos. A IA sugere as
                  melhores atividades para seu destino.
                </p>
              </div>

              {/* Steps */}
              <div className="flex flex-wrap gap-6 pt-2">
                {steps.map((step, i) => (
                  <div
                    key={step.number}
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${(i + 1) * 100}ms` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25">
                      {step.number}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{step.title}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </span>
                    </div>
                    {i < steps.length - 1 && <div className="hidden md:block h-px w-8 bg-border" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="animate-fade-in animate-delay-200">
              <HeroTripForm isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative border-y bg-muted/30">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="container py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 sm:text-4xl">Tudo para planejar sua aventura</h2>
            <p className="text-lg text-muted-foreground">
              Ferramentas poderosas que tornam o planejamento de viagens simples e divertido.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={cn(
                  "group relative flex flex-col items-center text-center p-8 rounded-2xl",
                  "bg-background border shadow-sm",
                  "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl">Por que usar Luis Travel?</h2>
              <p className="text-muted-foreground text-lg">
                Simplificamos o planejamento para você aproveitar mais.
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
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                  <Plane className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Comece grátis</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Crie sua conta e comece a planejar agora mesmo. Sem cartão de crédito
                    necessário.
                  </p>
                </div>
                <Button size="lg" className="w-full sm:w-auto px-8 shadow-lg" asChild>
                  <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                    {isAuthenticated ? "Ir para o Painel" : "Criar Conta Grátis"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

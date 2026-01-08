import { createFileRoute, Link } from "@tanstack/react-router"
import { Calendar, Check, Plane, Sparkles, Users } from "lucide-react"
import { HeroTripForm } from "@/components/landing"
import { FeatureCard } from "@/components/molecules"
import { LandingLayout } from "@/components/templates"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

const steps = [
  { number: "1", title: "Escolha o destino", description: "Digite para onde você quer ir" },
  { number: "2", title: "Defina as datas", description: "Selecione quando será sua viagem" },
  { number: "3", title: "Monte o roteiro", description: "Adicione atividades ao calendário" },
]

function LandingPage() {
  const { isAuthenticated } = Route.useRouteContext()

  return (
    <LandingLayout isAuthenticated={isAuthenticated}>
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Planeje sua viagem <span className="text-primary">em segundos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Crie roteiros detalhados, acompanhe voos e colabore com amigos. A IA sugere as
              melhores atividades para seu destino.
            </p>

            {/* How it works - inline */}
            <div className="flex flex-wrap gap-4 pt-4">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {step.number}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                  {i < steps.length - 1 && (
                    <span className="text-muted-foreground hidden md:inline">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <HeroTripForm isAuthenticated={isAuthenticated} />
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tudo para planejar sua aventura</h2>
            <p className="text-muted-foreground">
              Ferramentas poderosas que tornam o planejamento de viagens simples e divertido.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Calendar className="h-10 w-10" />}
              title="Calendário Visual"
              description="Arraste e solte atividades no calendário para montar seu roteiro"
            />
            <FeatureCard
              icon={<Plane className="h-10 w-10" />}
              title="Rastreamento de Voos"
              description="Acompanhe seus voos com status em tempo real"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Colaboração"
              description="Convide amigos para editar e visualizar sua viagem"
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10" />}
              title="Sugestões com IA"
              description="Receba recomendações personalizadas de atividades"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-20">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Por que usar Luis Travel?</h2>
            <div className="space-y-4">
              {[
                "Planeje viagens em minutos, não em horas",
                "Todas as informações em um só lugar",
                "Compartilhe com quem for viajar com você",
                "Acesse de qualquer dispositivo",
                "Sugestões inteligentes de atividades",
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
            <div className="space-y-4 text-center">
              <Plane className="h-16 w-16 mx-auto text-primary" />
              <h3 className="text-2xl font-bold">Comece grátis</h3>
              <p className="text-muted-foreground">
                Crie sua conta e comece a planejar agora mesmo. Sem cartão de crédito necessário.
              </p>
              <Button size="lg" asChild>
                <Link to={isAuthenticated ? "/dashboard" : "/register"}>Criar Conta Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}

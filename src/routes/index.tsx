import { createFileRoute, Link } from "@tanstack/react-router"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Plane, Calendar, Users, Sparkles } from "lucide-react"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Luis Travel</span>
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Plan Your Perfect Trip with{" "}
            <span className="text-primary">Luis Travel</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Create detailed travel itineraries, track your flights, and
            collaborate with friends. Let AI help you discover the best
            activities for your destination.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={session ? "/dashboard" : "/register"}>
                Start Planning
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/login">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Plan Your Adventure
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Calendar className="h-10 w-10" />}
              title="Smart Calendar"
              description="Visual calendar to plan activities with drag & drop scheduling"
            />
            <FeatureCard
              icon={<Plane className="h-10 w-10" />}
              title="Flight Tracking"
              description="Search and track flights with real-time status updates"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Collaboration"
              description="Invite friends to view and edit your travel plans"
            />
            <FeatureCard
              icon={<Sparkles className="h-10 w-10" />}
              title="AI Suggestions"
              description="Get personalized activity recommendations powered by AI"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of travelers who plan their trips with Luis Travel.
          </p>
          <Button size="lg" asChild>
            <Link to={session ? "/dashboard" : "/register"}>
              Create Your First Trip
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Luis Travel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background border">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

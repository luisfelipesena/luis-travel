import { createFileRoute, Link } from "@tanstack/react-router"
import { Calendar, Plane, Sparkles, Users } from "lucide-react"
import { authClient } from "@/auth"
import { FeatureCard } from "@/components/molecules"
import { LandingLayout } from "@/components/templates"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  return (
    <LandingLayout isAuthenticated={isAuthenticated}>
      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Plan Your Perfect Trip with <span className="text-primary">Luis Travel</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Create detailed travel itineraries, track your flights, and collaborate with friends.
            Let AI help you discover the best activities for your destination.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>Start Planning</Link>
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
            <Link to={isAuthenticated ? "/dashboard" : "/register"}>Create Your First Trip</Link>
          </Button>
        </div>
      </section>
    </LandingLayout>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { lucia } from '@/lib/auth'
import { cookies } from 'next/headers'

export default async function LandingPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(lucia.sessionCookieName)
  
  let user = null
  if (sessionCookie) {
    const session = await lucia.validateSession(sessionCookie.value)
    user = session.user
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              C
            </div>
            <h1 className="text-xl font-bold text-foreground">CityReport</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Button asChild variant="default" size="sm">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Sign In
                </Link>
                <Button asChild variant="default" size="sm">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                Civic Engagement Made Easy
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Report Issues. Drive Change.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Help improve your city by reporting infrastructure issues. From potholes to broken lights, your reports make a difference.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  <Link href="/report">Report an Issue</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary text-primary-foreground font-semibold"
                  >
                    <Link href="/auth/sign-up">Get Started Free</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                  >
                    <Link href="/issues">View Issues</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Issues Reported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">2K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">180+</div>
                <div className="text-sm text-muted-foreground">Issues Resolved</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-muted-foreground">Interactive Map Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/50 border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Why CityReport?</h3>
            <p className="text-lg text-muted-foreground">Streamline civic reporting with AI-powered classification and community voting.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold text-foreground mb-2">Smart Classification</h4>
              <p className="text-muted-foreground text-sm">
                AI automatically categorizes issues (potholes, lighting, drainage, etc.) for faster resolution.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-3">🗳️</div>
              <h4 className="font-bold text-foreground mb-2">Community Voting</h4>
              <p className="text-muted-foreground text-sm">
                Vote on issue urgency to help prioritize which problems get fixed first.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors">
              <div className="text-3xl mb-3">📸</div>
              <h4 className="font-bold text-foreground mb-2">Photo Evidence</h4>
              <p className="text-muted-foreground text-sm">
                Attach photos with your report to provide clear evidence of infrastructure issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">How It Works</h3>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Sign Up', desc: 'Create your free account' },
            { step: 2, title: 'Report', desc: 'Capture and report an issue' },
            { step: 3, title: 'AI Categorizes', desc: 'System classifies the issue' },
            { step: 4, title: 'Vote & Track', desc: 'Community votes & tracks progress' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                {item.step}
              </div>
              <h4 className="font-bold text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Make Your City Better?</h3>
          <p className="text-lg mb-8 opacity-90">
            Start reporting issues today and be part of the solution.
          </p>
          {user ? (
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90"
            >
              <Link href="/report">Report an Issue</Link>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90"
            >
              <Link href="/auth/sign-up">Join Free</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2024 CityReport. Making cities better through civic engagement.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

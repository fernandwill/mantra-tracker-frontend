'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sparkles, Target, Clock, BarChart3, ArrowRight, Star, Heart, Zap } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen gradient-surface">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Mobile Theme Toggle - Top */}
        <div className="flex justify-end mb-4 md:hidden">
          <ThemeToggle />
        </div>

        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full gradient-accent-bg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-accent-text">
              Mantra Tracker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="gradient-accent-bg text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-accent-bg mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight gradient-accent-text mb-6">
            Track Your Mindful Practice
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Cultivate mindfulness and track your spiritual journey with intention and grace. 
            Beautiful, intuitive tools for modern practitioners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gradient-accent-bg text-white text-lg px-8 py-6">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need for mindful practice</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg gradient-surface">
              <CardHeader>
                <Target className="w-12 h-12 text-pink-600 dark:text-pink-400 mb-4" />
                <CardTitle>Set Meaningful Goals</CardTitle>
                <CardDescription>
                  Define daily repetition goals that align with your spiritual practice and personal growth.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg gradient-surface">
              <CardHeader>
                <Clock className="w-12 h-12 text-pink-600 dark:text-pink-400 mb-4" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your daily practice with beautiful visualizations and maintain your mindful streaks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg gradient-surface">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-pink-600 dark:text-pink-400 mb-4" />
                <CardTitle>Gain Insights</CardTitle>
                <CardDescription>
                  Understand your practice patterns with detailed statistics and celebrate your achievements.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why choose Mantra Tracker?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for practitioners who value both tradition and modern convenience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4 p-6 rounded-lg bg-card border">
              <Star className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Intuitive Design</h3>
                <p className="text-sm text-muted-foreground">
                  Clean, distraction-free interface that keeps you focused on your practice
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 rounded-lg bg-card border">
              <Heart className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Mindful Approach</h3>
                <p className="text-sm text-muted-foreground">
                  Designed with meditation principles in mind for a peaceful experience
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 rounded-lg bg-card border">
              <Zap className="w-6 h-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Progress Motivation</h3>
                <p className="text-sm text-muted-foreground">
                  Visual feedback and achievements that inspire consistent practice
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-0 shadow-xl gradient-surface">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to begin?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of practitioners who have made mindfulness a daily habit with Mantra Tracker
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="gradient-accent-bg text-white text-lg px-8 py-6">
                  Start Your Journey Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}


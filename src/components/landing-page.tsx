'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sparkles, Target, Clock, TrendingUp, BarChart3, ArrowRight, Star, Heart, Zap } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mantra Tracker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Track Your Mindful Practice
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Cultivate mindfulness and track your spiritual journey with intention and grace. 
            Beautiful, intuitive tools for modern practitioners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6">
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
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardHeader>
                <Target className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mb-4" />
                <CardTitle>Set Meaningful Goals</CardTitle>
                <CardDescription>
                  Define daily repetition goals that align with your spiritual practice and personal growth.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <CardHeader>
                <Clock className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-4" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your daily practice with beautiful visualizations and maintain your mindful streaks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-amber-600 dark:text-amber-400 mb-4" />
                <CardTitle>Gain Insights</CardTitle>
                <CardDescription>
                  Understand your practice patterns with detailed analytics and celebrate your achievements.
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
              <Star className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Intuitive Design</h3>
                <p className="text-sm text-muted-foreground">
                  Clean, distraction-free interface that keeps you focused on your practice
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 rounded-lg bg-card border">
              <Heart className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Mindful Approach</h3>
                <p className="text-sm text-muted-foreground">
                  Designed with meditation principles in mind for a peaceful experience
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-6 rounded-lg bg-card border">
              <Zap className="w-6 h-6 text-indigo-500 mt-1 flex-shrink-0" />
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
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to begin?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of practitioners who have made mindfulness a daily habit with Mantra Tracker
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6">
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
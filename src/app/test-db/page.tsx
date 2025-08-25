'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TestResult {
  success: boolean
  error?: string
  [key: string]: unknown
}

export default function DatabaseTestPage() {
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('test@example.com')
  const [name, setName] = useState('Test User')

  const runDatabaseTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/db-diagnostics')
      const data = await response.json()
      setTestResult(data)
    } catch (_error) {
      setTestResult({ success: false, error: 'Failed to connect to test endpoint' })
    } finally {
      setLoading(false)
    }
  }

  const runHealthTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setTestResult(data)
    } catch (_error) {
      setTestResult({ success: false, error: 'Failed to connect to health endpoint' })
    } finally {
      setLoading(false)
    }
  }

  const runSetupTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/setup-db', { method: 'POST' })
      const data = await response.json()
      setTestResult(data)
    } catch (_error) {
      setTestResult({ success: false, error: 'Failed to connect to setup endpoint' })
    } finally {
      setLoading(false)
    }
  }

  const runRegisterTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: 'testpassword',
          name: name
        })
      })
      const data = await response.json()
      setTestResult(data)
    } catch (_error) {
      setTestResult({ success: false, error: 'Failed to connect to register endpoint' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Database Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Test database connectivity and operations
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Database Tests</CardTitle>
            <CardDescription>
              Run various tests to check database connectivity and operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={runDatabaseTest} disabled={loading}>
                {loading ? 'Testing...' : 'Run Diagnostics'}
              </Button>
              <Button onClick={runHealthTest} disabled={loading} variant="secondary">
                {loading ? 'Testing...' : 'Run Health Check'}
              </Button>
              <Button onClick={runSetupTest} disabled={loading} variant="destructive">
                {loading ? 'Setting up...' : 'Run Setup (Destructive)'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Test Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button onClick={runRegisterTest} disabled={loading} className="w-full">
              {loading ? 'Testing Registration...' : 'Test Registration'}
            </Button>

            {testResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
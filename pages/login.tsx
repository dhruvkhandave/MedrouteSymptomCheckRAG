import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { session, isLoading: sessionLoading } = useSessionContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sessionLoading && session) {
      router.replace('/')
    }
  }, [session, sessionLoading, router])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const redirectTo = (router.query.redirectedFrom as string) || '/'
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.replace(redirectTo)
  }

  return (
    <>
      <Head>
        <title>Login | MedRoute</title>
      </Head>
      <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 py-16 px-4 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 bg-indigo-300/30 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute top-24 -right-10 h-72 w-72 bg-purple-300/30 blur-3xl rounded-full" />
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-10 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome back</h1>
            <p className="text-sm text-gray-600 mb-8 text-center">
              Log in to view your saved health queries.
            </p>
            <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
                This tool does not provide medical advice and is for informational purposes only. By continuing you acknowledge it is not a diagnostic tool and is not for emergencies.
              </p>
            </form>

            <p className="text-sm text-gray-600 mt-6 text-center">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

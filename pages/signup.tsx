import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useEffect, useState } from 'react'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { session, isLoading: sessionLoading } = useSessionContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!sessionLoading && session) {
      router.replace('/')
    }
  }, [session, sessionLoading, router])

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>Sign Up | MedRoute</title>
      </Head>
      <main className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100 py-16 px-4 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-10 h-80 w-80 bg-indigo-300/30 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute top-24 -left-16 h-72 w-72 bg-purple-300/30 blur-3xl rounded-full" />
        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-10 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Create an account</h1>
            <p className="text-sm text-gray-600 mb-8 text-center">
              Sign up to save your health queries securely.
            </p>
            <form className="space-y-5" onSubmit={handleSignUp}>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                <span className="leading-relaxed">
                  I understand this tool does not provide medical advice, is informational only, and is not for emergencies.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !acknowledged}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-6 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

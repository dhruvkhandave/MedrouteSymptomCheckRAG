import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function Navbar() {
  const { session, isLoading } = useSessionContext()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    setLoggingOut(false)
    router.push('/login')
  }

  return (
    <header className="w-full border-b-2 border-slate-300 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-semibold text-slate-900">
            MedRoute
          </Link>
        
        </div>
        {!isLoading && (
          session ? (
            <nav className="flex items-center gap-3 text-sm">
              {session?.user?.email === 'dkdave12345678@gmail.com' ? (
                <Link
                  href="/admin/ai-manager"
                  className="px-3 py-2 rounded-sm border border-transparent text-gray-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Admin AI Manager
                </Link>
              ) : (
                <Link
                  href="/ai-manager"
                  className="px-3 py-2 rounded-sm border border-transparent text-gray-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  AI Manager
                </Link>
              )}
              <Link
                href="/appointment-ai-agent"
                className="px-3 py-2 rounded-sm border border-transparent text-gray-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Appointment AI Agent
              </Link>
              <button
                onClick={() => {
                  if (router.pathname === '/analyze') {
                    router.reload()
                  } else {
                    router.push('/analyze')
                  }
                }}
                className="px-3 py-2 rounded-sm border border-transparent text-gray-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Analyze
              </button>
              <Link
                href="/history"
                className="px-3 py-2 rounded-sm border border-transparent text-gray-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                History
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-3 py-2 rounded-sm text-white bg-slate-900 border border-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className="px-3 py-2 rounded-sm border border-transparent text-gray-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-2 rounded-sm text-white bg-slate-900 border border-slate-900 hover:bg-slate-800 transition-colors"
              >
                Sign Up
              </Link>
            </nav>
          )
        )}
      </div>
    </header>
  )
}

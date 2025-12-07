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
    <header className="w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-semibold text-indigo-700">
            MedRoute
          </Link>
          <span className="text-xs text-gray-500 leading-none">by Dhruv Khandave</span>
        </div>
        {!isLoading && (
          session ? (
            <nav className="flex items-center gap-3 text-sm">
              {session?.user?.email === 'dkdave12345678@gmail.com' ? (
                <Link
                  href="/admin/ai-manager"
                  className="px-3 py-2 rounded-lg text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                >
                  Admin AI Manager
                </Link>
              ) : (
                <Link
                  href="/ai-manager"
                  className="px-3 py-2 rounded-lg text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                >
                  AI Manager
                </Link>
              )}
              <button
                onClick={() => {
                  if (router.pathname === '/analyze') {
                    router.reload()
                  } else {
                    router.push('/analyze')
                  }
                }}
                className="px-3 py-2 rounded-lg text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                Analyze
              </button>
              <Link
                href="/history"
                className="px-3 py-2 rounded-lg text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                History
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="px-3 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg text-gray-700 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-3 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
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

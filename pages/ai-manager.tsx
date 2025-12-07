import { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSessionContext } from '@supabase/auth-helpers-react'

const ADMIN_EMAIL = 'dkdave12345678@gmail.com'

export default function AiManagerRedirect() {
  const { session, isLoading } = useSessionContext()
  const router = useRouter()
  const isAdmin = !!session?.user?.email && session.user.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.replace('/admin/ai-manager')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        <Head>
          <title>AI Manager | MedRoute</title>
        </Head>
        Loading...
      </main>
    )
  }

  if (isAdmin) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Head>
        <title>AI Manager | MedRoute</title>
      </Head>
      <div className="max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center space-y-3">
        <h1 className="text-2xl font-semibold text-gray-900">AI Manager</h1>
        <p className="text-sm text-gray-600">
          The AI Manager is available to administrators. Please contact your admin if you need a rule added.
        </p>
      </div>
    </main>
  )
}

import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

type Rule = {
  id: string
  raw_text: string | null
  condition: any
  overrides: any
}

const ADMIN_EMAIL = 'dkdave12345678@gmail.com'

export default function AdminAIManagerPage() {
  const { session, isLoading } = useSessionContext()
  const router = useRouter()
  const [rawText, setRawText] = useState('')
  const [rules, setRules] = useState<Rule[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isAdmin = !!session?.user?.email && session.user.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/')
    }
  }, [isLoading, isAdmin, router])

  const loadRules = async () => {
    setStatus(null)
    try {
      const resp = await fetch('/api/admin/rules/list')
      if (!resp.ok) throw new Error('Failed to fetch rules')
      const data = await resp.json()
      setRules(data || [])
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to fetch rules')
    }
  }

  useEffect(() => {
    if (isAdmin) loadRules()
  }, [isAdmin])

  const handleAddRule = async () => {
    if (!rawText.trim()) {
      setStatus('Please enter a description.')
      return
    }
    setStatus(null)
    setLoading(true)
    try {
      const parseResp = await fetch('/api/admin/rules/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText }),
      })
      if (!parseResp.ok) {
        const data = await parseResp.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to parse rule')
      }
      const parsed = await parseResp.json()
      const createResp = await fetch('/api/admin/rules/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText, condition: parsed.condition, overrides: parsed.overrides }),
      })
      if (!createResp.ok) {
        const data = await createResp.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save rule')
      }
      setRawText('')
      setStatus('Rule added')
      await loadRules()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to add rule')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setStatus(null)
    try {
      const resp = await fetch('/api/admin/rules/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete rule')
      }
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to delete rule')
    }
  }

  if (!isAdmin) return null

  return (
    <>
      <Head>
        <title>Admin AI Manager | MedRoute</title>
      </Head>
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin AI Manager</h1>
            <p className="text-gray-600">Create and manage global AI rules.</p>
          </div>

          {status && (
            <div className="p-3 border border-amber-200 bg-amber-50 text-amber-800 rounded-lg text-sm">{status}</div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Describe a rule for the AI. Example: 'Never classify burning stomach as acid reflux.'"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddRule}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add Rule'}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Global Rules</h2>
            {rules.length === 0 ? (
              <div className="text-sm text-gray-500">No rules yet.</div>
            ) : (
              <div className="overflow-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="px-3 py-2">Raw Text</th>
                      <th className="px-3 py-2">Condition</th>
                      <th className="px-3 py-2">Overrides</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-t border-gray-200">
                        <td className="px-3 py-2 align-top text-gray-800">{rule.raw_text || '—'}</td>
                        <td className="px-3 py-2 align-top text-gray-700">
                          <pre className="whitespace-pre-wrap text-xs bg-gray-50 rounded p-2 border border-gray-100">
{JSON.stringify(rule.condition, null, 2)}
                          </pre>
                        </td>
                        <td className="px-3 py-2 align-top text-gray-700">
                          <pre className="whitespace-pre-wrap text-xs bg-gray-50 rounded p-2 border border-gray-100">
{JSON.stringify(rule.overrides, null, 2)}
                          </pre>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

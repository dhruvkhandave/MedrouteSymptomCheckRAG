import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'

import type { HistoryRow } from '@/lib/types'

const formatDate = (value?: string) => {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

const parseInputSummary = (text?: string) => {
  if (!text) return ''
  const followMarker = 'Follow-up:'
  const followIdx = text.indexOf(followMarker)
  const base = followIdx === -1 ? text : text.slice(0, followIdx)
  const symMarker = 'Symptoms:'
  const symIdx = base.indexOf(symMarker)
  if (symIdx !== -1) {
    return base.slice(symIdx + symMarker.length).trim()
  }
  return base.trim()
}

export default function HistoryPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { isLoading: sessionLoading } = useSessionContext()

  const [sessionChecked, setSessionChecked] = useState(false)
  const [items, setItems] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const verifySessionAndLoad = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/login')
        return
      }
      setSessionChecked(true)
      setLoading(true)
      try {
        const response = await fetch('/api/history', { credentials: 'include' })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to load history')
        }
        const payload = await response.json()
        setItems(payload.queries || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    if (!sessionLoading) {
      void verifySessionAndLoad()
    }
  }, [sessionLoading, router, supabase])

  const hasHistory = useMemo(() => items.length > 0, [items])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      const resp = await fetch('/api/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete entry')
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Head>
        <title>History | MedRoute</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your History</h1>
              <p className="text-sm text-gray-600 mt-1">Previously analyzed symptom entries.</p>
            </div>
            <Link
              href="/analyze"
              className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg shadow-sm hover:border-indigo-400 hover:text-indigo-900 transition-colors"
            >
              New Analysis
            </Link>
          </div>

          {!sessionChecked && !loading && (
            <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700">Checking session...</div>
          )}

          {loading && (
            <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700">Loading history...</div>
          )}

          {error && (
            <div className="bg-white rounded-lg shadow p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {!loading && !error && !hasHistory && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-700">No history yet.</p>
              <p className="text-sm text-gray-500 mt-2">Run an analysis to see it here.</p>
            </div>
          )}

          {!loading && !error && hasHistory && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Past analyses</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        className="flex-1 text-left"
                        onClick={() => router.push(`/history/${item.id}`)}
                      >
                        <div className="text-sm text-gray-500">{formatDate(item.created_at)}</div>
                        {(() => {
                          const structured = item.structured_output?.structured_output
                          const symptoms = structured?.symptoms?.length ? structured.symptoms.join(', ') : ''
                          const fallback = parseInputSummary(item.input_text) || 'Symptom entry'
                          return (
                            <div className="font-semibold text-gray-900 mt-1 line-clamp-2">
                              {symptoms || fallback}
                            </div>
                          )
                        })()}
                        {item.structured_output && (
                          <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-2 items-center">
                            {item.structured_output.urgency && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                Urgency: {item.structured_output.urgency}
                              </span>
                            )}
                            {item.structured_output.structured_output?.severity && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                Severity: {item.structured_output.structured_output.severity}
                              </span>
                            )}
                            {item.structured_output.structured_output?.duration && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                Duration: {item.structured_output.structured_output.duration}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-indigo-600 font-medium">View</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

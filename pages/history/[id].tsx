import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSessionContext, useSupabaseClient } from '@supabase/auth-helpers-react'

import type { AnalyzeResponse, HistoryRow, RetrievedSource, SourceMatch } from '@/lib/types'

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'mild':
      return 'text-green-600'
    case 'moderate':
      return 'text-yellow-600'
    case 'severe':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export default function HistoryDetailPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { isLoading: sessionLoading } = useSessionContext()

  const [query, setQuery] = useState<HistoryRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const result = useMemo<AnalyzeResponse | null>(() => query?.structured_output || null, [query])

  const followUps = useMemo(() => {
    const answers = result?.structured_output?.followup_answers
    if (answers && typeof answers === 'object') {
      return Object.entries(answers).map(([q, a]) => ({
        question: q,
        answer: a || 'No response provided',
      }))
    }
    return []
  }, [result])

  const formattedDate = useMemo(() => {
    if (!query?.created_at) return ''
    try {
      return new Date(query.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }, [query?.created_at])

  useEffect(() => {
    const loadEntry = async () => {
      if (!router.isReady) {
        return
      }

      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/login')
        return
      }

      const entryId = router.query.id
      if (!entryId || typeof entryId !== 'string') {
        setError('Invalid history entry')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/history?id=${entryId}`, {
          credentials: 'include',
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error || 'Failed to load history entry')
        }
        const payload = await response.json()
        setQuery(payload.query || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history entry')
      } finally {
        setLoading(false)
      }
    }

    if (!sessionLoading && router.isReady) {
      void loadEntry()
    }
  }, [router, router.isReady, router.query.id, sessionLoading, supabase])

  return (
    <>
      <Head>
        <title>History Detail | MedRoute</title>
      </Head>
      <main className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 bg-indigo-300/30 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute top-24 -right-10 h-72 w-72 bg-purple-300/30 blur-3xl rounded-full" />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Summary</h1>
              <p className="text-sm text-gray-600 mt-1">{formattedDate || 'Past result recap.'}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/history"
                className="px-4 py-2 text-sm font-medium text-indigo-700 bg-white border border-indigo-200 rounded-lg shadow-sm hover:border-indigo-400 hover:text-indigo-900 transition-colors"
              >
                Back to History
              </Link>
              <Link
                href="/analyze"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                New Analysis
              </Link>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700">Loading...</div>
          )}

          {error && (
            <div className="bg-white rounded-lg shadow p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {!loading && !error && result && (
            <div className="bg-white/90 border border-gray-100 rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                {/* Symptoms and timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Symptoms (AI parsed)
                    </div>
                    <p className="text-sm text-gray-800">
                      {result.structured_output.symptoms.length > 0
                        ? result.structured_output.symptoms.join(', ')
                        : 'Not provided'}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Symptom Timeline</div>
                    <p className="text-sm text-gray-800">
                      {result.structured_output.symptom_onset || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Core Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Duration</div>
                    <div className="text-gray-900">{result.structured_output.duration || 'Not provided'}</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Severity</div>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                        result.structured_output.severity === 'mild'
                          ? 'bg-green-100 text-green-800'
                          : result.structured_output.severity === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.structured_output.severity.charAt(0).toUpperCase() +
                        result.structured_output.severity.slice(1)}
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Urgency</div>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getUrgencyColor(
                        result.urgency
                      )}`}
                    >
                      {result.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Recommended Specialist
                    </div>
                    <div className="text-gray-900">
                      {result.structured_output.recommended_specialist || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Risk factors */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Risk Factors</div>
                  {result.structured_output.risk_factors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.structured_output.risk_factors.map((risk, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                        >
                          {risk}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-700 text-sm">None noted</div>
                  )}
                </div>

                {/* Patient Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Patient Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
                    {renderInfoRow('Medical history', result.structured_output.medical_history)}
                    {renderInfoRow('Lifestyle factors', result.structured_output.lifestyle)}
                    {renderInfoRow('Symptom timeline', result.structured_output.symptom_onset)}
                    {renderInfoRow('Sleep hours', result.structured_output.sleep_hours)}
                    {renderInfoRow('Hydration', result.structured_output.hydration_level)}
                    {renderInfoRow('Stress level', result.structured_output.stress_level)}
                    {renderInfoRow('Recent travel', result.structured_output.recent_travel)}
                    {renderInfoRow('Exercise level', result.structured_output.exercise_level)}
                    {renderInfoRow('Diet changes', result.structured_output.diet_changes)}
                    {renderInfoRow('Illness exposure', result.structured_output.recent_illness_exposure)}
                    {renderInfoRow('Alcohol use', result.structured_output.alcohol_use)}
                    {renderInfoRow('Drug use', result.structured_output.drug_use)}
                    {renderInfoRow('Sexual activity', result.structured_output.sexual_activity)}
                    {renderInfoRow('Menstrual cycle', result.structured_output.menstrual_cycle)}
                    {renderInfoRow('Chronic conditions', result.structured_output.chronic_conditions)}
                    {renderInfoRow('Medications', result.structured_output.current_medications)}
                  </div>
                </div>

                {/* Follow-up Responses */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Follow-up Responses</div>
                  {followUps.length > 0 ? (
                    <div className="space-y-3">
                      {followUps.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-sm font-semibold text-gray-800">{item.question}</div>
                          <div className="text-sm text-gray-700 mt-1">{item.answer}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700">No follow-up responses captured.</div>
                  )}
                </div>

                {/* Recommended Action */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Recommended Action</div>
                  <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                    <div className="text-indigo-900">{result.recommended_action}</div>
                  </div>
                </div>

                {/* Reference Patterns (AI-identified) */}
                {result.rag_sources && result.rag_sources.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                        Reference Patterns (AI-identified)
                      </h3>
                      <p className="text-xs text-gray-500 italic">
                        Informational only; not a diagnosis.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {result.rag_sources.map((rag: RetrievedSource) => (
                        <div key={rag.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{rag.title}</h4>
                            {rag.similarity !== undefined && (
                              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                {Math.round(rag.similarity * 100)}% match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{rag.summary}</p>
                          <div className="mt-3 pt-3 border-t border-purple-200">
                            <p className="text-xs font-medium text-gray-600 mb-1">Guidance:</p>
                            <p className="text-sm text-gray-800">{rag.guidance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">
                      Clinical Sources
                    </h3>
                    <div className="space-y-3">
                        {result.sources.slice(0, 2).map((src: SourceMatch, idx: number) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                            <div className="font-medium text-gray-900 mb-1">{src.condition}</div>
                            {src.matchedSymptoms && src.matchedSymptoms.length > 0 && (
                              <div className="text-xs text-gray-600 mb-2">
                                Matched symptoms: {src.matchedSymptoms.join(', ')}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {src.sources.map((s: { name: string; url: string }, i: number) => (
                              <a
                                key={i}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                {s.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {result.next_steps && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-sm text-gray-700 mb-4 uppercase tracking-wide">
                      Timeline
                    </h3>

                    <div className="space-y-4">
                      {result.next_steps.immediate && result.next_steps.immediate.length > 0 && (
                        <div>
                          <div className="font-medium text-red-700 mb-2">Immediate (0–24 hours)</div>
                          <ul className="list-disc list-inside ml-2 text-sm text-gray-700 space-y-1">
                            {result.next_steps.immediate.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.next_steps.shortTerm && result.next_steps.shortTerm.length > 0 && (
                        <div>
                          <div className="font-medium text-yellow-700 mb-2">Short term (1–3 days)</div>
                          <ul className="list-disc list-inside ml-2 text-sm text-gray-700 space-y-1">
                            {result.next_steps.shortTerm.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.next_steps.seekCare && result.next_steps.seekCare.length > 0 && (
                        <div>
                          <div className="font-medium text-blue-700 mb-2">When to seek care</div>
                          <ul className="list-disc list-inside ml-2 text-sm text-gray-700 space-y-1">
                            {result.next_steps.seekCare.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700">
              No details available.
            </div>
          )}
        </div>
      </main>
    </>
  )
}
  const renderInfoRow = (label: string, value: string | string[] | undefined) => {
    const display =
      Array.isArray(value) ? (value.length ? value.join(', ') : 'Not provided') : value || 'Not provided'
    return (
      <div>
        <span className="font-medium text-gray-600">{label}:</span> {display}
      </div>
    )
  }

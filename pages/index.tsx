import { useState } from 'react'
import Head from 'next/head'

interface StructuredOutput {
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  risk_factors: string[]
}

interface SourceMatch {
  condition: string
  matchedSymptoms: string[]
  score: number
  sources: Array<{ name: string; url: string }>
}

interface NextSteps {
  immediate: string[]
  shortTerm: string[]
  seekCare: string[]
}

interface AnalyzeResponse {
  structured_output: StructuredOutput
  final_score: number
  urgency: 'low' | 'medium' | 'high'
  recommended_action: string
  debug?: string[]
  sources?: SourceMatch[]
  next_steps?: NextSteps
}

export default function Home() {
  const [step, setStep] = useState(1)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [duration, setDuration] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [followUps, setFollowUps] = useState<string[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [view, setView] = useState<'doctor' | 'json'>('doctor')
  const [showDebug, setShowDebug] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateFollowUps = () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms')
      return
    }

    const rules: string[] = []
    const text = symptoms.toLowerCase()

    if (text.includes('chest pain')) {
      rules.push('Does the pain radiate to your arm, jaw, or back?')
    }

    if (text.includes('cough')) {
      rules.push('Is the cough dry or producing mucus?')
    }

    if (text.includes('fever')) {
      rules.push('Has the fever been consistent or on and off?')
    }

    if (rules.length === 0) {
      rules.push('Are the symptoms getting better, worse, or staying the same?')
    }

    setFollowUps(rules)
    setError(null)
    setStep(2)
  }

  const handleAnalyzeFlow = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    const fullText = `
Age: ${age}
Gender: ${gender}
Duration: ${duration}
Symptoms: ${symptoms}
Follow-up: ${JSON.stringify(followUpAnswers)}
    `.trim()

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: fullText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze symptoms')
      }

      const data: AnalyzeResponse = await response.json()
      setResult(data)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze symptoms')
      }

      const data: AnalyzeResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

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


  return (
    <>
      <Head>
        <title>MedRoute</title>
        <meta name="description" content="Healthcare symptom analysis demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MedRoute</h1>
            <p className="text-gray-600">Healthcare symptom analysis with AI-powered triage</p>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    id="duration"
                    type="text"
                    placeholder="Duration (ex: 2 days, 1 week)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    placeholder="e.g., I've been experiencing chest pain and shortness of breath for the past hour..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={4}
                  />
                </div>

                <button
                  onClick={handleGenerateFollowUps}
                  disabled={!symptoms.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Follow-Up Questions */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Follow-Up Questions</h2>
              <div className="space-y-4">
                {followUps.map((q, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {q}
                    </label>
                    <input
                      type="text"
                      placeholder="Your answer"
                      value={followUpAnswers[q] || ''}
                      onChange={(e) =>
                        setFollowUpAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleAnalyzeFlow}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      'Analyze Symptoms'
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <button
                  onClick={() => {
                    setStep(1)
                    setResult(null)
                    setAge('')
                    setGender('')
                    setDuration('')
                    setSymptoms('')
                    setFollowUps([])
                    setFollowUpAnswers({})
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                >
                  Start New Analysis
                </button>
              </div>

              {/* Patient Info Summary */}
              {(age || gender || duration) && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {age && <div><span className="font-medium text-gray-600">Age:</span> <span className="text-gray-900">{age}</span></div>}
                    {gender && <div><span className="font-medium text-gray-600">Gender:</span> <span className="text-gray-900 capitalize">{gender}</span></div>}
                    {duration && <div><span className="font-medium text-gray-600">Duration:</span> <span className="text-gray-900">{duration}</span></div>}
                  </div>
                </div>
              )}

              {/* Tab Toggle */}
              <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setView('doctor')}
                  className={`pb-3 px-1 font-medium transition-colors ${
                    view === 'doctor'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Doctor View
                </button>
                <button
                  onClick={() => setView('json')}
                  className={`pb-3 px-1 font-medium transition-colors ${
                    view === 'json'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Raw JSON View
                </button>
              </div>

              {/* Doctor View */}
              {view === 'doctor' && (
                <div className="space-y-6">
                  {/* Symptoms */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Symptoms</div>
                    <ul className="list-disc list-inside space-y-1">
                      {result.structured_output.symptoms.map((symptom, idx) => (
                        <li key={idx} className="text-gray-900">
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Severity */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Severity</div>
                    <div>
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
                  </div>

                  {/* Duration */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Duration</div>
                    <div className="text-gray-900">{result.structured_output.duration}</div>
                  </div>

                  {/* Risk Factors */}
                  {result.structured_output.risk_factors.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Risk Factors</div>
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
                    </div>
                  )}

                  {/* Urgency */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Urgency</div>
                    <div>
                      <span
                        className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getUrgencyColor(result.urgency)}`}
                      >
                        {result.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Recommended Action</div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                      <div className="text-indigo-900">{result.recommended_action}</div>
                    </div>
                  </div>

                  {/* Clinical Patterns & Sources */}
                  {result.sources && result.sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">
                        Clinical patterns & sources
                      </h3>
                      <div className="space-y-3">
                        {result.sources.map((src: SourceMatch, idx: number) => (
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

                  {/* Next Steps Timeline */}
                  {result.next_steps && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-sm text-gray-700 mb-4 uppercase tracking-wide">
                        Next Steps Timeline
                      </h3>

                      <div className="space-y-4">
                        {/* Immediate */}
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

                        {/* Short term */}
                        {result.next_steps.shortTerm && result.next_steps.shortTerm.length > 0 && (
                          <div>
                            <div className="font-medium text-yellow-700 mb-2">Short-Term Monitoring (24–72 hours)</div>
                            <ul className="list-disc list-inside ml-2 text-sm text-gray-700 space-y-1">
                              {result.next_steps.shortTerm.map((step: string, i: number) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Seek care */}
                        {result.next_steps.seekCare && result.next_steps.seekCare.length > 0 && (
                          <div>
                            <div className="font-medium text-blue-700 mb-2">When To Seek Medical Care</div>
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

                  {/* Constraint Debugger Toggle */}
                  {result.debug && result.debug.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline mb-2"
                      >
                        {showDebug ? 'Hide Constraint Debugger' : 'Show Constraint Debugger'}
                      </button>

                      {showDebug && (
                        <div className="bg-gray-900 text-gray-200 p-4 rounded text-sm mt-2 whitespace-pre-line">
                          {result.debug.map((line: string, i: number) => (
                            <div key={i}>• {line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Raw JSON View */}
              {view === 'json' && (
                <pre className="bg-gray-900 text-gray-200 p-4 rounded overflow-x-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  )
}


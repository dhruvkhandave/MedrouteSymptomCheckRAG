import Head from 'next/head'
import Link from 'next/link'
import { useSessionContext } from '@supabase/auth-helpers-react'

export default function LandingPage() {
  const { session } = useSessionContext()

  const primaryCta = session ? '/analyze' : '/login'

  return (
    <>
      <Head>
        <title>MedRoute | AI-powered symptom analysis</title>
        <meta name="description" content="Healthcare symptom analysis with AI-powered triage." />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
              Trusted AI triage companion
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              AI-powered symptom analysis
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Describe your symptoms and get structured insights, urgency guidance, and reference patterns so you can make informed decisions faster.
            </p>
            <div className="mt-6 space-x-3">
              <Link
                href={primaryCta}
                className="px-6 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors font-semibold"
              >
                Get Started
              </Link>
              {!session && (
                <Link href="/signup" className="text-indigo-700 font-semibold hover:underline">
                  Create an account
                </Link>
              )}
            </div>
            <ul className="mt-8 space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Instant triage with severity and urgency scoring.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Reference patterns from curated clinical knowledge (RAG).
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                Save your analyses securely to revisit anytime.
              </li>
            </ul>
          </div>
          <div className="bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-8 border border-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white/70 to-purple-50/60 pointer-events-none" />
            <div className="relative">
              <div className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                How it works
              </div>
              <ol className="space-y-4 text-gray-800">
                <li className="flex gap-3">
                  <span className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                    1
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">Tell us your symptoms</div>
                    <div className="text-sm text-gray-600">Enter your symptoms and relevant details in plain language.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                    2
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">AI triage + retrieval</div>
                    <div className="text-sm text-gray-600">We structure your input, score urgency, and surface similar patterns.</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                    3
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900">Actionable next steps</div>
                    <div className="text-sm text-gray-600">See recommended actions, when to seek care, and saved history.</div>
                  </div>
                </li>
              </ol>
              <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900">
                Already using MedRoute?{' '}
                <Link href={primaryCta} className="font-semibold underline">
                  Go to intake
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 py-16 px-4">
          <div className="max-w-6xl mx-auto text-white">
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-200 font-semibold">
                Technical Internals
              </p>
              <h2 className="text-3xl font-bold mt-2">A peek under the hood at how MedRoute analyzes symptoms with AI.</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'AI Symptom Parsing',
                  description:
                    'Your description is sent to a Groq Llama-3 model that extracts symptoms, severity, duration, and clinical signals with structured JSON output.',
                  icon: '🧠',
                },
                {
                  title: 'RAG Assisted Understanding',
                  description:
                    'MedRoute uses a retrieval-augmented layer that compares your symptoms to curated clinical patterns via embeddings and semantic search.',
                  icon: '🔎',
                },
                {
                  title: 'Embeddings Reduce Hallucination',
                  description:
                    'Symptoms are converted to embeddings and compared against real medical patterns—input → embedding → similarity → pattern match—to keep responses grounded.',
                  icon: '🧭',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 p-6 max-w-xl shadow-lg text-white transition-all duration-700 hover:-translate-y-1 hover:border-white/30"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xl">{card.icon}</span>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                  </div>
                  <p className="text-sm text-indigo-100 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

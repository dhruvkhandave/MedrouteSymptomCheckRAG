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
      <main className="min-h-screen bg-slate-50 [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:22px_22px]">
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center px-3 py-1 border border-slate-300 bg-white text-slate-700 text-xs font-semibold uppercase tracking-[0.12em] mb-4">
              Clinical triage assistant
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Structured symptom triage for faster care decisions
            </h1>
            <p className="mt-4 text-lg text-slate-700">
              Describe symptoms in plain language and get a consistent triage summary with urgency level, recommended next step, and reference patterns.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href={primaryCta}
                className="px-6 py-3 text-white bg-slate-900 hover:bg-slate-800 transition-colors font-semibold rounded-sm border border-slate-900"
              >
                Get Started
              </Link>
              {!session && (
                <Link href="/signup" className="text-slate-800 font-semibold underline underline-offset-4 hover:text-slate-900">
                  Create an account
                </Link>
              )}
            </div>
            <ul className="mt-8 space-y-3 text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 bg-slate-900" />
                Instant triage with severity and urgency scoring.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 bg-slate-900" />
                Reference patterns from curated clinical knowledge (RAG).
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 bg-slate-900" />
                Save your analyses securely to revisit anytime.
              </li>
            </ul>
          </div>
          <div className="bg-white border-2 border-slate-300 p-8 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-[0.12em]">
                How it works
              </div>
              <ol className="text-slate-800">
                <li className="flex gap-3 pb-4 border-b border-slate-200">
                  <span className="h-8 w-8 flex items-center justify-center border border-slate-900 bg-slate-900 text-white font-bold rounded-sm">
                    1
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">Tell us your symptoms</div>
                    <div className="text-sm text-slate-600">Enter your symptoms and relevant details in plain language.</div>
                  </div>
                </li>
                <li className="flex gap-3 py-4 border-b border-slate-200">
                  <span className="h-8 w-8 flex items-center justify-center border border-slate-900 bg-slate-900 text-white font-bold rounded-sm">
                    2
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">AI triage and retrieval</div>
                    <div className="text-sm text-slate-600">We structure your input, score urgency, and surface similar patterns.</div>
                  </div>
                </li>
                <li className="flex gap-3 pt-4">
                  <span className="h-8 w-8 flex items-center justify-center border border-slate-900 bg-slate-900 text-white font-bold rounded-sm">
                    3
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900">Actionable next steps</div>
                    <div className="text-sm text-slate-600">See recommended actions, when to seek care, and saved history.</div>
                  </div>
                </li>
              </ol>
              <div className="mt-8 bg-slate-100 border border-slate-300 p-4 text-sm text-slate-800">
                Already using MedRoute?{' '}
                <Link href={primaryCta} className="font-semibold underline underline-offset-4">
                  Go to intake
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t-2 border-slate-300 bg-white">
          <div className="max-w-6xl mx-auto text-slate-900">
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-600 font-semibold">
                Technical Internals
              </p>
              <h2 className="text-3xl font-bold mt-2">How MedRoute produces consistent triage output.</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  id: '01',
                  title: 'AI Symptom Parsing',
                  description:
                    'Your description is sent to Groq Llama 3 where symptoms, duration, and risk signals are normalized into structured JSON.',
                },
                {
                  id: '02',
                  title: 'RAG Assisted Understanding',
                  description:
                    'A retrieval layer compares your case with curated clinical patterns using embeddings and similarity search.',
                },
                {
                  id: '03',
                  title: 'Grounded Pattern Matching',
                  description:
                    'Similarity matching keeps output anchored to known reference patterns before recommendations are displayed.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="border-2 border-slate-300 bg-slate-50 p-6 max-w-xl transition-colors hover:bg-white"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-xs font-bold tracking-[0.16em] text-slate-500 pt-1">{card.id}</span>
                    <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

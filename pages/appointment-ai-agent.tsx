import Head from "next/head"
import { FormEvent, useEffect, useRef, useState } from "react"

type AgentState = {
  step: string
  specialty?: string | null
  clinicId?: string | null
  slot?: string | null
  email?: string | null
  done?: boolean
  preferredSpecialty?: string | null
  userEmail?: string | null
}

export default function AppointmentAIAgent() {
  const defaultIntro = "Hi, I can help you book an appointment. What specialty do you need?"
  const [messages, setMessages] = useState([
    { from: "agent", text: defaultIntro },
  ])
  const [state, setState] = useState<AgentState>({ step: "intent", preferredSpecialty: null })
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Prefill with last recommended specialist if available and supported
  useEffect(() => {
    const supported = new Set([
      "Cardiology",
      "Dermatology",
      "Orthopedics",
      "Primary Care",
      "Neurology",
      "Psychiatry",
      "Gastroenterology",
      "Pulmonology",
      "Endocrinology",
      "Rheumatology",
      "Oncology",
    ])

    const normalizeRec = (value?: string | null) => {
      if (!value) return null
      const lower = value.toLowerCase()
      if (lower.includes("cardio")) return "Cardiology"
      if (lower.includes("derm")) return "Dermatology"
      if (lower.includes("ortho")) return "Orthopedics"
      if (lower.includes("neuro")) return "Neurology"
      if (lower.includes("psych")) return "Psychiatry"
      if (lower.includes("gastro")) return "Gastroenterology"
      if (lower.includes("pulmo")) return "Pulmonology"
      if (lower.includes("endo")) return "Endocrinology"
      if (lower.includes("rheum")) return "Rheumatology"
      if (lower.includes("onco")) return "Oncology"
      if (lower.includes("family") || lower.includes("primary")) return "Primary Care"
      return null
    }

    const loadLast = async () => {
      try {
        const resp = await fetch("/api/history", { credentials: "include" })
        if (!resp.ok) return
        const data = await resp.json()
        const latest = (data?.queries || [])[0]
        const recRaw = latest?.structured_output?.structured_output?.recommended_specialist
        const rec = normalizeRec(recRaw)
        if (rec && supported.has(rec)) {
          setState((prev) => ({ ...prev, preferredSpecialty: rec }))
          setMessages([{ from: "agent", text: `It looks like you were last recommended a ${rec} specialist. Want to book with that?` }])
        }
      } catch {
        // ignore failures; keep default intro
      }
    }
    void loadLast()
  }, [])

  const send = async (text: string) => {
    if (!text.trim() || loading) return

    setMessages((m) => [...m, { from: "user", text }])
    setInput("")
    setLoading(true)

    try {
      const r = await fetch("/api/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, state }),
      })

      const data = await r.json()
      setState(data)
      setMessages((m) => [...m, { from: "agent", text: data.say }])
    } catch {
      setMessages((m) => [...m, { from: "agent", text: "I couldn't process that. Please try again." }])
    } finally {
      setLoading(false)
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Head>
        <title>Appointment AI Agent</title>
      </Head>

      <div className="max-w-3xl mx-auto py-10">
        <div className="bg-white border rounded-xl p-4 h-[420px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
              <span className="inline-block my-1 px-3 py-2 rounded-lg bg-gray-100">
                {m.text}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            send(input)
          }}
          className="flex gap-2 mt-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Type your message..."
          />
          <button
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  )
}

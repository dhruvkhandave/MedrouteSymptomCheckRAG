import type { NextApiRequest, NextApiResponse } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ---------------- DATA ----------------

const clinics = [
  {
    id: "patel-cardio",
    name: "Dr. Aisha Patel",
    specialty: "Cardiology",
    distance: "0.8 miles",
    slots: ["Tue 3 PM", "Wed 10 AM", "Thu 1 PM"],
  },
  {
    id: "nguyen-cardio",
    name: "Dr. Minh Nguyen",
    specialty: "Cardiology",
    distance: "1.5 miles",
    slots: ["Mon 11 AM", "Thu 4 PM"],
  },
  {
    id: "lee-derm",
    name: "Dr. James Lee",
    specialty: "Dermatology",
    distance: "1.2 miles",
    slots: ["Wed 9 AM", "Thu 11 AM", "Fri 2 PM"],
  },
  {
    id: "rodriguez-ortho",
    name: "Dr. Sofia Rodriguez",
    specialty: "Orthopedics",
    distance: "2.0 miles",
    slots: ["Tue 1 PM", "Fri 10 AM"],
  },
  {
    id: "khan-pcp",
    name: "Dr. Omar Khan",
    specialty: "Primary Care",
    distance: "0.5 miles",
    slots: ["Mon 9 AM", "Wed 3 PM", "Fri 1 PM"],
  },
]

const supportedSpecialties = new Set(clinics.map((c) => c.specialty))

// ---------------- HELPERS ----------------

const extractEmail = (text: string) =>
  text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null

const inferSpecialty = (text: string) => {
  const t = text.toLowerCase()
  if (t.includes("cardio")) return "Cardiology"
  if (t.includes("derm")) return "Dermatology"
  if (t.includes("ortho")) return "Orthopedics"
  if (t.includes("primary") || t.includes("pcp")) return "Primary Care"
  return null
}

const askingForOptions = (text: string) =>
  /(which|what|list|show).*(doctor|doctors|ones|options|available)/i.test(text)

const inferClinic = (text: string, specialty?: string | null) => {
  const t = text.toLowerCase()
  return (
    clinics.find((c) => {
      if (specialty && c.specialty !== specialty) return false
      return c.name
        .toLowerCase()
        .split(" ")
        .some((token) => token.length > 2 && t.includes(token))
    })?.id || null
  )
}

const normalizeSlot = (text: string, slots: string[]) => {
  const t = text.toLowerCase().replace(/\s+/g, "")

  const time =
    t.includes("9am") ? "9 AM" :
    t.includes("10am") ? "10 AM" :
    t.includes("11am") ? "11 AM" :
    t.includes("1pm") ? "1 PM" :
    t.includes("3pm") ? "3 PM" :
    t.includes("4pm") ? "4 PM" :
    null

  if (!time) return null

  const day =
    t.includes("mon") ? "Mon" :
    t.includes("tue") ? "Tue" :
    t.includes("wed") ? "Wed" :
    t.includes("thu") ? "Thu" :
    t.includes("fri") ? "Fri" :
    null

  const candidates = slots.filter(s => s.includes(time))
  if (day) return candidates.find(s => s.startsWith(day)) || null
  return candidates[0] || null
}

const isAffirmative = (text: string) =>
  /(^|\b)(yes|yeah|yep|sure|ok|okay|please|do it|go ahead|sounds good)\b/i.test(text)

// ---------------- LLM (specialty only) ----------------

async function extractSpecialtyLLM(transcript: string) {
  try {
    const r = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 50,
      messages: [
        { role: "system", content: "Return JSON { specialty: string | null } only." },
        { role: "user", content: transcript },
      ],
    })
    return JSON.parse(r.choices[0].message.content)?.specialty || null
  } catch {
    return null
  }
}

// ---------------- HANDLER ----------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end()

  // Get user email from Supabase session (if logged in)
  const supabase = createPagesServerClient({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userEmail = user?.email || null

  const { transcript = "", state = {} } = req.body

  let {
    step = "intent",
    specialty = null,
    clinicId = null,
    slot = null,
    email = null,
    done = false,
    preferredSpecialty = null,
    userEmail: stateEmail = null,
  } = state

  const normalizedPreferred =
    preferredSpecialty && supportedSpecialties.has(preferredSpecialty)
      ? preferredSpecialty
      : null
  const effectiveEmail = userEmail || stateEmail || null

  // -------- FINAL --------
  if (step === "final" && done) {
    const found = extractEmail(transcript)
    if (found && !email) {
      return res.json({
        step: "final",
        specialty,
        clinicId,
        slot,
        email: found,
        userEmail: effectiveEmail,
        done: true,
        preferredSpecialty: normalizedPreferred,
        say: `Confirmation sent to ${found}.`,
      })
    }

    return res.json({
      step: "final",
      specialty,
      clinicId,
      slot,
      email,
      userEmail: effectiveEmail,
      done: true,
      preferredSpecialty: normalizedPreferred,
      say: "You're all set.",
    })
  }

  // -------- INTENT --------
  if (step === "intent") {
    if (normalizedPreferred && isAffirmative(transcript)) {
      specialty = normalizedPreferred
    } else {
      specialty =
        inferSpecialty(transcript) ||
        (await extractSpecialtyLLM(transcript))
    }

    if (!specialty) {
      return res.json({
        step: "intent",
        specialty: null,
        clinicId: null,
        slot: null,
        email: null,
        userEmail: effectiveEmail,
        done: false,
        preferredSpecialty: normalizedPreferred,
        say: "What specialty do you need? Cardiology, Dermatology, Orthopedics, or Primary Care.",
      })
    }

    const matches = clinics.filter(c => c.specialty === specialty)

    return res.json({
      step: "clinics",
      specialty,
      clinicId: null,
      slot: null,
      email: null,
      userEmail: effectiveEmail,
      done: false,
      preferredSpecialty: normalizedPreferred,
      say: `Available doctors: ${matches.map(c => c.name).join(", ")}. Which doctor would you like?`,
    })
  }

  // -------- CLINICS --------
  if (step === "clinics") {
    const matches = clinics.filter(c => c.specialty === specialty)

    if (askingForOptions(transcript)) {
      return res.json({
        step: "clinics",
        specialty,
        clinicId: null,
        slot: null,
        email: null,
        userEmail: effectiveEmail,
        done: false,
        preferredSpecialty: normalizedPreferred,
        say: `Available doctors: ${matches.map(c => c.name).join(", ")}. Which doctor would you like?`,
      })
    }

    clinicId = inferClinic(transcript, specialty)

    if (!clinicId) {
      return res.json({
        step: "clinics",
        specialty,
        clinicId: null,
        slot: null,
        email: null,
        done: false,
        preferredSpecialty: normalizedPreferred,
        say: `Available doctors: ${matches.map(c => c.name).join(", ")}. Which doctor would you like?`,
      })
    }

    const c = clinics.find(x => x.id === clinicId)!

    return res.json({
      step: "slots",
      specialty,
      clinicId,
      slot: null,
      email: null,
      userEmail: effectiveEmail,
      done: false,
      preferredSpecialty: normalizedPreferred,
      say: `For ${c.name}, available times are ${c.slots.join(", ")}. Which time works?`,
    })
  }

  // -------- SLOTS --------
  if (step === "slots") {
    const c = clinics.find(x => x.id === clinicId)!
    slot = normalizeSlot(transcript, c.slots)

    if (!slot) {
      return res.json({
        step: "slots",
        specialty,
      clinicId,
      slot: null,
      email: null,
      userEmail: effectiveEmail,
      done: false,
      preferredSpecialty: normalizedPreferred,
      say: `Available times for ${c.name}: ${c.slots.join(", ")}. Which works?`,
    })
  }

    return res.json({
      step: "confirm",
      specialty,
      clinicId,
      slot,
      email: null,
      userEmail: effectiveEmail,
      done: false,
      preferredSpecialty: normalizedPreferred,
      say: `Confirm ${c.name} at ${slot}?`,
    })
  }

  // -------- CONFIRM --------
  if (step === "confirm") {
    if (!/(yes|confirm|book|ok)/i.test(transcript)) {
      return res.json({
        step: "confirm",
        specialty,
      clinicId,
      slot,
      email: null,
      userEmail: effectiveEmail,
      done: false,
      preferredSpecialty: normalizedPreferred,
      say: "Please confirm yes or no.",
    })
  }

    return res.json({
      step: "email",
      specialty,
      clinicId,
      slot,
      email: null,
      userEmail: effectiveEmail,
      done: false,
      preferredSpecialty: normalizedPreferred,
      say: effectiveEmail
        ? `Send confirmation to your account email (${effectiveEmail})?`
        : "Please sign in to send a confirmation email.",
    })
  }

  // -------- EMAIL --------
  if (step === "email") {
    if (!effectiveEmail) {
      return res.json({
        step: "email",
        specialty,
        clinicId,
        slot,
        email: null,
        userEmail: effectiveEmail,
        done: false,
        preferredSpecialty: normalizedPreferred,
        say: "Please sign in to send a confirmation email.",
      })
    }

    if (!isAffirmative(transcript)) {
      return res.json({
        step: "email",
        specialty,
        clinicId,
        slot,
        email: null,
        userEmail: effectiveEmail,
        done: false,
        preferredSpecialty: normalizedPreferred,
        say: `I can only send to your account email (${effectiveEmail}). Say yes to confirm.`,
      })
    }

    return res.json({
      step: "final",
      specialty,
      clinicId,
      slot,
      email: effectiveEmail,
      userEmail: effectiveEmail,
      done: true,
      preferredSpecialty: normalizedPreferred,
      say: `Booked. Confirmation sent to ${effectiveEmail}.`,
    })
  }

  return res.status(500).end()
}

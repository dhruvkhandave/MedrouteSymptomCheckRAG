import type { NextApiRequest, NextApiResponse } from 'next'
import Groq from 'groq-sdk'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/types'

const groqApiKey = process.env.GROQ_API_KEY
const groq = groqApiKey
  ? new Groq({
      apiKey: groqApiKey,
    })
  : null

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createPagesServerClient<Database>({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!ADMIN_EMAIL) return res.status(500).json({ error: 'Admin email not configured' })
  if (!user || user.email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Unauthorized' })

  const { raw_text } = req.body || {}
  if (!raw_text || typeof raw_text !== 'string') {
    return res.status(400).json({ error: 'raw_text is required' })
  }
  if (!groq) return res.status(500).json({ error: 'LLM not configured' })

  const prompt = `You convert admin policy text into rule JSON.
Return JSON only with shape:
{
  "condition": {
    "includes": string[] (optional)
  },
  "overrides": {
    "suppress_labels": string[] (optional),
    "fallback_label": string (optional),
    "interpret_as": string (optional),
    "recommended_action": string (optional),
    "severity_adjust": "mild"|"moderate"|"severe" (optional)
  }
}

Example:
Input: "Never classify burning stomach as acid reflux."
Output: {"condition":{"includes":["burning stomach"]},"overrides":{"suppress_labels":["acid_reflux"],"fallback_label":"unspecified_symptom"}}

Input: "${raw_text}"
Return ONLY valid JSON.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You convert admin policy text into structured rule JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    })
    const content = completion.choices[0]?.message?.content?.trim() || ''
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim()
    const match = cleaned.match(/{[\s\S]*}/)
    const jsonText = match ? match[0] : cleaned
    let parsed
    try {
      parsed = JSON.parse(jsonText)
    } catch (parseErr) {
      console.error('admin rules/parse JSON parse error', parseErr, { cleaned })
      return res.status(400).json({ error: 'Could not parse rule JSON from LLM.' })
    }
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('admin rules/parse error', err)
    return res.status(500).json({ error: 'Failed to parse rule' })
  }
}

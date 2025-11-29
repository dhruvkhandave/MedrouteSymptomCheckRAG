import type { NextApiRequest, NextApiResponse } from 'next'
import Groq from 'groq-sdk'

// Types for structured output
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

// Validate required environment variables on module load
const groqApiKey = process.env.GROQ_API_KEY
if (!groqApiKey) {
  console.error('ERROR: GROQ_API_KEY environment variable is missing!')
  console.error('The server cannot start without this key.')
  process.exit(1)
}

// Initialize Groq client
const groq = new Groq({
  apiKey: groqApiKey,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | { error: string }>
) {
  // Runtime validation: ensure API key is still available
  if (!process.env.GROQ_API_KEY) {
    console.error('ERROR: GROQ_API_KEY is missing at runtime!')
    return res.status(500).json({ error: 'Server configuration error: API key missing' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { symptoms } = req.body

  if (!symptoms || typeof symptoms !== 'string') {
    return res.status(400).json({ error: 'Symptoms description is required' })
  }

  try {
    // ============================================
    // STEP 1: LLM INTERPRETER
    // ============================================
    const prompt = `Convert the user's symptoms into this exact JSON format:

{
  "symptoms": string[],
  "severity": "mild" | "moderate" | "severe",
  "duration": string,
  "risk_factors": string[]
}

Only return valid JSON. No extra text.

User's symptoms: ${symptoms}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a medical assistant that extracts structured information from symptom descriptions. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0,
    })

    const llmResponse = completion.choices[0]?.message?.content?.trim()
    if (!llmResponse) {
      return res.status(500).json({ error: 'Failed to get LLM response' })
    }

    // Parse JSON from LLM response
    let structuredOutput: StructuredOutput
    try {
      // Remove any markdown code blocks if present
      const cleaned = llmResponse.trim().replace(/```json/g, '').replace(/```/g, '').trim()
      structuredOutput = JSON.parse(cleaned)
    } catch (parseError) {
      return res.status(500).json({ error: 'Failed to parse LLM response as JSON' })
    }

    // ============================================
    // STEP 2: CONSTRAINT VALIDATOR
    // ============================================
    
    // Initialize debug logs array
    let debugLogs: string[] = []

    // Validate and set defaults
    if (!structuredOutput.symptoms || structuredOutput.symptoms.length === 0) {
      structuredOutput.symptoms = ['unspecified']
      debugLogs.push("Symptoms missing; applied default = 'unspecified'.")
    }

    if (!structuredOutput.severity || !['mild', 'moderate', 'severe'].includes(structuredOutput.severity)) {
      structuredOutput.severity = 'moderate'
      debugLogs.push("Severity missing; applied default = 'moderate'.")
    }

    if (!structuredOutput.duration) {
      structuredOutput.duration = 'unknown'
      debugLogs.push("Duration missing; normalized to 'unknown'.")
    }

    if (!structuredOutput.risk_factors) {
      structuredOutput.risk_factors = []
    }

    // Constraint rule: chest pain + shortness of breath → add "critical" to risk_factors
    const symptomsLower = structuredOutput.symptoms.map(s => s.toLowerCase())
    const hasChestPain = symptomsLower.some(s => s.includes('chest pain'))
    const hasShortnessOfBreath = symptomsLower.some(s => s.includes('shortness of breath') || s.includes('shortness'))

    if (hasChestPain && hasShortnessOfBreath) {
      if (!structuredOutput.risk_factors.includes('critical')) {
        structuredOutput.risk_factors.push('critical')
        debugLogs.push("Detected chest pain + shortness of breath → added risk 'critical'.")
      }
    }

    // ============================================
    // STEP 3: OPTIMIZATION LAYER (TRIAGE SCORING)
    // ============================================

    // Calculate severity score
    const severityScores: Record<string, number> = {
      mild: 1,
      moderate: 2,
      severe: 3,
    }
    const severityScore = severityScores[structuredOutput.severity] || 2

    // Calculate risk score
    const riskScore = structuredOutput.risk_factors.length * 2

    // Duration score (kept simple as requested)
    const durationScore = 1

    // Final score
    const finalScore = severityScore + riskScore + durationScore

    // Determine urgency and recommended action
    let urgency: 'low' | 'medium' | 'high'
    let recommendedAction: string

    if (finalScore < 4) {
      urgency = 'low'
      recommendedAction = 'Rest and monitor symptoms. Consider over-the-counter remedies if appropriate.'
    } else if (finalScore < 7) {
      urgency = 'medium'
      recommendedAction = 'Schedule a clinic visit within 24-48 hours for evaluation.'
    } else {
      urgency = 'high'
      recommendedAction = 'Seek urgent care or emergency medical attention immediately.'
    }

    // Log scoring breakdown
    debugLogs.push(
      `Computed triage score: severity=${severityScore}, risk=${riskScore}, duration=${durationScore}, final=${finalScore}`
    )
    debugLogs.push(`Urgency level set to '${urgency}'.`)

    // ============================================
    // SOURCE VALIDATION LAYER
    // ============================================
    const medicalPatterns = [
      {
        id: 'cardiac_chest_pain',
        condition: 'Possible cardiac-related chest pain',
        matchSymptoms: ['chest pain', 'shortness of breath'],
        sources: [
          { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org/diseases-conditions/heart-attack' },
          { name: 'American Heart Association', url: 'https://www.heart.org/' },
        ],
      },
      {
        id: 'resp_infection',
        condition: 'Possible respiratory infection',
        matchSymptoms: ['cough', 'fever', 'shortness of breath'],
        sources: [
          { name: 'CDC', url: 'https://www.cdc.gov/respiratory-viruses/' },
          { name: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org/health/diseases' },
        ],
      },
      {
        id: 'mild_uri',
        condition: 'Likely mild upper respiratory infection',
        matchSymptoms: ['sore throat', 'runny nose', 'fatigue'],
        sources: [
          { name: 'NHS', url: 'https://www.nhs.uk/conditions/common-cold/' },
        ],
      },
    ]

    function matchSources(structured: StructuredOutput): SourceMatch[] {
      const userSymptoms = (structured.symptoms || []).map((s: string) => s.toLowerCase())
      const matches = medicalPatterns
        .map((pattern) => {
          const matched = pattern.matchSymptoms.filter((sym) =>
            userSymptoms.some((us) => us.includes(sym))
          )
          const score = matched.length / pattern.matchSymptoms.length
          return {
            condition: pattern.condition,
            matchedSymptoms: matched,
            score,
            sources: pattern.sources,
          }
        })
        .filter((m) => m.score > 0) // only keep patterns with at least 1 overlap

      return matches.sort((a, b) => b.score - a.score)
    }

    const sourceMatches = matchSources(structuredOutput)
    if (sourceMatches.length > 0) {
      debugLogs.push(`Matched ${sourceMatches.length} clinical pattern(s) against curated sources.`)
    }

    // ============================================
    // NEXT STEPS GENERATOR
    // ============================================
    function generateNextSteps(structured: StructuredOutput, urgency: 'low' | 'medium' | 'high'): NextSteps {
      const steps: NextSteps = {
        immediate: [],
        shortTerm: [],
        seekCare: [],
      }

      // Immediate actions
      if (urgency === 'high') {
        steps.immediate.push(
          'Avoid physical exertion immediately.',
          'Sit or lie down and monitor symptoms every 15 minutes.',
          'Have someone nearby in case symptoms escalate.'
        )
      } else if (urgency === 'medium') {
        steps.immediate.push(
          'Rest and reduce physical activity.',
          'Drink plenty of fluids.',
          'Take over-the-counter pain relievers if needed.'
        )
      } else {
        steps.immediate.push(
          'Maintain normal activity but avoid overexertion.',
          'Track symptom frequency throughout the day.'
        )
      }

      // Short-term monitoring
      const symptomsLower = structured.symptoms.map((s) => s.toLowerCase())
      const hasFever = symptomsLower.some((s) => s.includes('fever'))
      const hasCough = symptomsLower.some((s) => s.includes('cough'))

      if (hasFever) {
        steps.shortTerm.push(
          'Check temperature every 4–6 hours.',
          'Watch for worsening fever or chills.'
        )
      }

      if (hasCough) {
        steps.shortTerm.push(
          'Monitor cough intensity.',
          'Watch for difficulty breathing or persistent chest tightness.'
        )
      }

      steps.shortTerm.push(
        'If symptoms do not improve within 48–72 hours, consider follow-up evaluation.'
      )

      // When to seek care
      if (urgency === 'high') {
        steps.seekCare.push(
          'Seek urgent care or emergency attention immediately.',
          'If chest pain worsens or shortness of breath increases, call emergency services.'
        )
      } else {
        steps.seekCare.push(
          'Seek medical care if symptoms escalate rapidly.',
          'Seek care if new severe symptoms appear (difficulty breathing, confusion, persistent high fever).'
        )
      }

      return steps
    }

    const nextSteps = generateNextSteps(structuredOutput, urgency)

    // ============================================
    // FINAL RESPONSE
    // ============================================
    return res.status(200).json({
      structured_output: structuredOutput,
      final_score: finalScore,
      urgency,
      recommended_action: recommendedAction,
      debug: debugLogs,
      sources: sourceMatches,
      next_steps: nextSteps,
    })
  } catch (error) {
    console.error('Error in analyze endpoint:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}


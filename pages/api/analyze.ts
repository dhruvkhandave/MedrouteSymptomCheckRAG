import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import Groq from 'groq-sdk'
import { retrieveRelevantSources, type RetrievedSource } from '@/lib/retrieval'
import { applyGlobalRules, applyRagSuppression, applyRulesForUser } from '@/lib/rules'
import type { Database } from '@/lib/types'

// Types for structured output
interface StructuredOutput {
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe' | 'extremely severe'
  duration: string
  risk_factors: string[]
  recommended_specialist?: string
  medical_history?: string[]
  lifestyle?: string[]
  symptom_onset?: string
  followup_questions?: string[]
  followup_answers?: Record<string, string>
  sleep_hours?: string
  hydration_level?: string
  stress_level?: string
  recent_travel?: string
  exercise_level?: string
  diet_changes?: string
  recent_illness_exposure?: string
  alcohol_use?: string
  drug_use?: string
  sexual_activity?: string
  menstrual_cycle?: string
  chronic_conditions?: string[]
  current_medications?: string[]
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
  rag_sources?: RetrievedSource[]
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

// Medical patterns for source matching
const medicalPatterns = [
  {
    id: 'cardiac_chest_pain',
    condition: 'Possible cardiac-related chest pain',
    matchSymptoms: [
      'chest pain',
      'chest pressure',
      'pain in left arm',
      'jaw pain',
      'shortness of breath',
      'tightness in chest'
    ],
    sources: [
      { name: 'Mayo Clinic – Heart Attack', url: 'https://www.mayoclinic.org/diseases-conditions/heart-attack' },
      { name: 'American Heart Association', url: 'https://www.heart.org/' },
      { name: 'Cleveland Clinic – Chest Pain', url: 'https://my.clevelandclinic.org/health/symptoms/17649-chest-pain' },
      { name: 'Johns Hopkins Medicine – Chest Pain', url: 'https://www.hopkinsmedicine.org/health/conditions-and-diseases/chest-pain' },
      { name: 'NIH – Cardiac Symptoms', url: 'https://www.nhlbi.nih.gov/' }
    ],
  },
  {
    id: 'resp_infection',
    condition: 'Possible respiratory infection',
    matchSymptoms: [
      'cough',
      'productive cough',
      'fever',
      'chills',
      'shortness of breath',
      'nasal congestion'
    ],
    sources: [
      { name: 'CDC – Respiratory Viruses', url: 'https://www.cdc.gov/respiratory-viruses/' },
      { name: 'WHO – Respiratory Illnesses', url: 'https://www.who.int/health-topics/respiratory-tract-diseases' },
      { name: 'Cleveland Clinic – URI', url: 'https://my.clevelandclinic.org/health/diseases/17747-upper-respiratory-infection' },
      { name: 'Mayo Clinic – Pneumonia', url: 'https://www.mayoclinic.org/diseases-conditions/pneumonia' },
      { name: 'Johns Hopkins – Respiratory Infections', url: 'https://www.hopkinsmedicine.org/health/conditions-and-diseases/respiratory-infection' }
    ],
  },
  {
    id: 'mild_uri',
    condition: 'Likely mild upper respiratory infection',
    matchSymptoms: [
      'sore throat',
      'runny nose',
      'sneezing',
      'mild fatigue',
      'nasal congestion'
    ],
    sources: [
      { name: 'NHS – Common Cold', url: 'https://www.nhs.uk/conditions/common-cold/' },
      { name: 'CDC – Colds', url: 'https://www.cdc.gov/antibiotic-use/colds.html' },
      { name: 'Cleveland Clinic – Common Cold', url: 'https://my.clevelandclinic.org/health/diseases/17607-common-cold' },
      { name: 'Mayo Clinic – Cold', url: 'https://www.mayoclinic.org/diseases-conditions/common-cold' }
    ],
  },
  {
    id: 'depression_fatigue',
    condition: 'Possible depression-related fatigue',
    matchSymptoms: [
      'persistent sadness',
      'loss of interest',
      'fatigue',
      'sleep disturbance'
    ],
    sources: [
      { name: 'NIMH – Depression', url: 'https://www.nimh.nih.gov/health/topics/depression' },
      { name: 'Psychology Today – Depression Overview', url: 'https://www.psychologytoday.com/us/basics/depression' },
      { name: 'Cleveland Clinic – Depression Symptoms', url: 'https://my.clevelandclinic.org/health/diseases/9290-depression' }
    ]
  },
  {
    id: 'gastro_issue',
    condition: 'Possible gastrointestinal distress',
    matchSymptoms: [
      'abdominal pain',
      'nausea',
      'vomiting',
      'diarrhea',
      'cramping',
      'bloating'
    ],
    sources: [
      { name: 'Mayo Clinic – Stomach Pain', url: 'https://www.mayoclinic.org/symptoms/abdominal-pain' },
      { name: 'Cleveland Clinic – Gastroenteritis', url: 'https://my.clevelandclinic.org/health/diseases/10360-gastroenteritis' },
      { name: 'Johns Hopkins – Stomach Issues', url: 'https://www.hopkinsmedicine.org/health/conditions-and-diseases/stomach-pain' },
      { name: 'NIH – Digestive Diseases', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases' }
    ],
  },
  {
    id: 'anxiety_shortness_breath',
    condition: 'Possible panic attack or anxiety response',
    matchSymptoms: [
      'racing heart',
      'chest tightness',
      'shortness of breath',
      'lightheadedness',
      'tingling'
    ],
    sources: [
      { name: 'NIMH – Anxiety Disorders', url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders' },
      { name: 'NHS – Panic Disorder', url: 'https://www.nhs.uk/mental-health/conditions/panic-disorder/' },
      { name: 'Mayo Clinic – Panic Attacks', url: 'https://www.mayoclinic.org/diseases-conditions/panic-attacks' }
    ]
  },
  {
    id: 'allergic_reaction',
    condition: 'Possible allergic reaction',
    matchSymptoms: [
      'hives',
      'itching',
      'skin redness',
      'swelling',
      'rash'
    ],
    sources: [
      { name: 'AAAAI – Allergies', url: 'https://www.aaaai.org/conditions-treatments/allergies' },
      { name: 'Mayo Clinic – Allergic Reactions', url: 'https://www.mayoclinic.org/diseases-conditions/allergic-reactions' },
      { name: 'Cleveland Clinic – Hives', url: 'https://my.clevelandclinic.org/health/diseases/17707-hives' }
    ]
  },
  {
    id: 'fatigue_general',
    condition: 'General fatigue – broad causes',
    matchSymptoms: [
      'fatigue',
      'tiredness',
      'low energy'
    ],
    sources: [
      { name: 'CDC – Chronic Fatigue', url: 'https://www.cdc.gov/me-cfs/' },
      { name: 'Mayo Clinic – Fatigue', url: 'https://www.mayoclinic.org/symptoms/fatigue' },
      { name: 'Cleveland Clinic – Fatigue Causes', url: 'https://my.clevelandclinic.org/health/symptoms/21403-fatigue' }
    ]
  },
    {
    id: 'stroke_warning_signs',
    condition: 'Possible stroke or neurological emergency',
    matchSymptoms: [
      'facial drooping',
      'arm weakness',
      'slurred speech',
      'sudden numbness',
      'sudden vision loss',
      'sudden confusion'
    ],
    sources: [
      { name: 'CDC – Stroke Signs', url: 'https://www.cdc.gov/stroke/signs_symptoms.htm' },
      { name: 'American Stroke Association', url: 'https://www.stroke.org/en/about-stroke/stroke-symptoms' },
      { name: 'Mayo Clinic – Stroke', url: 'https://www.mayoclinic.org/diseases-conditions/stroke' }
    ]
  },
  {
    id: 'asthma_exacerbation',
    condition: 'Possible asthma flare-up',
    matchSymptoms: [
      'wheezing',
      'shortness of breath',
      'chest tightness',
      'coughing at night',
      'difficulty breathing after exercise'
    ],
    sources: [
      { name: 'CDC – Asthma', url: 'https://www.cdc.gov/asthma/' },
      { name: 'AAAAI – Asthma Attacks', url: 'https://www.aaaai.org/conditions-and-treatments/asthma' },
      { name: 'Mayo Clinic – Asthma', url: 'https://www.mayoclinic.org/diseases-conditions/asthma' }
    ]
  },
  {
    id: 'flu_influenza',
    condition: 'Possible influenza infection',
    matchSymptoms: [
      'fever',
      'body aches',
      'fatigue',
      'headache',
      'dry cough',
      'chills'
    ],
    sources: [
      { name: 'CDC – Influenza', url: 'https://www.cdc.gov/flu/' },
      { name: 'WHO – Influenza', url: 'https://www.who.int/health-topics/influenza' },
      { name: 'Mayo Clinic – Flu', url: 'https://www.mayoclinic.org/diseases-conditions/flu' }
    ]
  },
  {
    id: 'covid_infection',
    condition: 'Possible COVID-19 infection',
    matchSymptoms: [
      'loss of taste',
      'loss of smell',
      'fever',
      'cough',
      'fatigue',
      'shortness of breath'
    ],
    sources: [
      { name: 'CDC – COVID-19', url: 'https://www.cdc.gov/coronavirus/2019-ncov/' },
      { name: 'WHO – COVID-19', url: 'https://www.who.int/health-topics/coronavirus' }
    ]
  },
  {
    id: 'migraine_pattern',
    condition: 'Possible migraine headache',
    matchSymptoms: [
      'throbbing headache',
      'headache worse with light',
      'nausea with headache',
      'visual aura',
      'one-sided headache'
    ],
    sources: [
      { name: 'American Migraine Foundation', url: 'https://americanmigrainefoundation.org/' },
      { name: 'Mayo Clinic – Migraine', url: 'https://www.mayoclinic.org/diseases-conditions/migraine' }
    ]
  },
  {
    id: 'sinus_infection',
    condition: 'Possible sinus infection (sinusitis)',
    matchSymptoms: [
      'sinus pressure',
      'facial pain',
      'thick nasal mucus',
      'congested nose',
      'headache around eyes'
    ],
    sources: [
      { name: 'Mayo Clinic – Sinusitis', url: 'https://www.mayoclinic.org/diseases-conditions/sinusitis' },
      { name: 'Cleveland Clinic – Sinus Infection', url: 'https://my.clevelandclinic.org/health/diseases/17714-sinusitis' }
    ]
  },
  {
    id: 'uti_pattern',
    condition: 'Possible urinary tract infection (UTI)',
    matchSymptoms: [
      'burning urination',
      'frequent urination',
      'urgency to urinate',
      'lower abdominal pain',
      'cloudy urine'
    ],
    sources: [
      { name: 'Mayo Clinic – UTI', url: 'https://www.mayoclinic.org/diseases-conditions/urinary-tract-infection' },
      { name: 'Cleveland Clinic – UTI', url: 'https://my.clevelandclinic.org/health/diseases/5023-urinary-tract-infection' }
    ]
  },
  {
    id: 'kidney_stones',
    condition: 'Possible kidney stones',
    matchSymptoms: [
      'back pain',
      'flank pain',
      'pain radiating to groin',
      'blood in urine',
      'nausea with pain'
    ],
    sources: [
      { name: 'Mayo Clinic – Kidney Stones', url: 'https://www.mayoclinic.org/diseases-conditions/kidney-stones' },
      { name: 'Cleveland Clinic – Kidney Stones', url: 'https://my.clevelandclinic.org/health/diseases/15604-kidney-stones' }
    ]
  },
  {
    id: 'appendicitis_pattern',
    condition: 'Possible appendicitis',
    matchSymptoms: [
      'right lower abdominal pain',
      'pain worse with movement',
      'loss of appetite',
      'fever',
      'nausea'
    ],
    sources: [
      { name: 'Mayo Clinic – Appendicitis', url: 'https://www.mayoclinic.org/diseases-conditions/appendicitis' },
      { name: 'Cleveland Clinic – Appendicitis', url: 'https://my.clevelandclinic.org/health/diseases/10248-appendicitis' }
    ]
  },
  {
    id: 'gallbladder_attack',
    condition: 'Possible gallbladder attack (biliary colic)',
    matchSymptoms: [
      'right upper abdominal pain',
      'pain after fatty meals',
      'nausea after eating',
      'shoulder blade pain'
    ],
    sources: [
      { name: 'Johns Hopkins – Gallbladder Disease', url: 'https://www.hopkinsmedicine.org/health/conditions-and-diseases/gallstones' },
      { name: 'Mayo Clinic – Gallstones', url: 'https://www.mayoclinic.org/diseases-conditions/gallstones' }
    ]
  },
  {
    id: 'mono_infection',
    condition: 'Possible mononucleosis (mono)',
    matchSymptoms: [
      'extreme fatigue',
      'sore throat',
      'swollen lymph nodes',
      'fever'
    ],
    sources: [
      { name: 'CDC – Epstein Barr (Mono)', url: 'https://www.cdc.gov/epstein-barr/' },
      { name: 'Cleveland Clinic – Mono', url: 'https://my.clevelandclinic.org/health/diseases/8260-mononucleosis' }
    ]
  },
  {
    id: 'diabetes_high_blood_sugar',
    condition: 'Possible high blood sugar (hyperglycemia)',
    matchSymptoms: [
      'frequent urination',
      'excessive thirst',
      'unexplained weight loss',
      'blurry vision',
      'fatigue'
    ],
    sources: [
      { name: 'CDC – Diabetes', url: 'https://www.cdc.gov/diabetes/' },
      { name: 'Mayo Clinic – Hyperglycemia', url: 'https://www.mayoclinic.org/diseases-conditions/hyperglycemia' }
    ]
  },
  {
    id: 'thyroid_imbalance',
    condition: 'Possible thyroid imbalance',
    matchSymptoms: [
      'hair loss',
      'cold intolerance',
      'heat intolerance',
      'fatigue',
      'weight gain',
      'weight loss'
    ],
    sources: [
      { name: 'American Thyroid Association', url: 'https://www.thyroid.org/' },
      { name: 'Mayo Clinic – Hypothyroidism', url: 'https://www.mayoclinic.org/diseases-conditions/hypothyroidism' },
      { name: 'Mayo Clinic – Hyperthyroidism', url: 'https://www.mayoclinic.org/diseases-conditions/hyperthyroidism' }
    ]
  }
]


// Source matching function
const matchSources = (structured: StructuredOutput): SourceMatch[] => {
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

// Next steps generator function
const generateNextSteps = (
  structured: StructuredOutput,
  urgency: 'low' | 'medium' | 'high'
): NextSteps => {
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

const buildFollowupQuestions = (text: string): string[] => {
  const lower = text.toLowerCase()
  const categories: Array<{ match: boolean; questions: string[] }> = [
    {
      match: ['chest pain', 'pressure', 'jaw pain', 'arm pain', 'shortness of breath'].some((t) =>
        lower.includes(t)
      ),
      questions: [
        'Does the pain radiate to your arm, neck, or jaw?',
        'Did symptoms begin suddenly or gradually?',
        'Are symptoms worse with activity?',
      ],
    },
    {
      match: ['cough', 'fever', 'congestion', 'wheezing'].some((t) => lower.includes(t)),
      questions: [
        'Are you experiencing difficulty breathing?',
        'Is the cough productive (mucus)?',
        'Have you had recent exposure to someone sick?',
      ],
    },
    {
      match: ['abdominal pain', 'nausea', 'vomiting', 'diarrhea'].some((t) => lower.includes(t)),
      questions: [
        'Does eating make symptoms better or worse?',
        'Have you had any recent meals that seemed unusual or spoiled?',
        'Are you able to keep fluids down?',
      ],
    },
    {
      match: ['fever', 'chills', 'fatigue'].some((t) => lower.includes(t)),
      questions: [
        'Have you checked your temperature?',
        'Have symptoms worsened over the last 24 hours?',
        'Any recent travel or exposure to sick contacts?',
      ],
    },
    {
      match: ['hives', 'swelling', 'rash'].some((t) => lower.includes(t)),
      questions: [
        'Did you recently eat or take anything new?',
        'Are symptoms getting worse quickly?',
        'Any swelling of lips, face, or throat?',
      ],
    },
  ]

  const collected: string[] = []
  categories.forEach((cat) => {
    if (cat.match && collected.length < 3) {
      collected.push(...cat.questions)
    }
  })

  return collected.slice(0, 9)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyzeResponse | { error: string }>
) {
  const body = req.body || {}
  const payload = body.basic && body.symptoms ? body : null
  const symptomsFromPayload =
    payload &&
    `
Basic Info:
- Age: ${payload.basic?.age || 'Not provided'}
- Gender: ${payload.basic?.gender || 'Not provided'}
- Duration: ${payload.basic?.duration || 'Not provided'}

Lifestyle:
- Sleep: ${payload.lifestyle?.sleep ?? 'Not provided'}
- Hydration: ${payload.lifestyle?.hydration ?? 'Not provided'}
- Stress: ${payload.lifestyle?.stress ?? 'Not provided'}
- Exercise: ${payload.lifestyle?.exercise ?? 'Not provided'}
- Chronic conditions: ${payload.lifestyle?.chronic_conditions || 'Not provided'}
- Medications: ${payload.lifestyle?.medications || 'Not provided'}

Symptoms:
- Description: ${payload.symptoms?.description || 'Not provided'}
- Severity (1-10): ${payload.symptoms?.severity ?? 'Not provided'}
- Progression: ${payload.symptoms?.progression || 'Not provided'}
- Follow-ups: ${JSON.stringify(payload.symptoms?.followups || [])}
`.trim()

  const {
    symptoms = symptomsFromPayload,
    medicalHistory = [],
    lifestyle = [],
    onset = payload?.basic?.duration || '',
    followUpQuestions = payload?.symptoms?.followups?.map((f: any) => f.question) || [],
    followUpAnswers =
      payload?.symptoms?.followups?.reduce(
        (acc: Record<string, string>, f: any) => ({ ...acc, [f.question]: f.answer }),
        {}
      ) || {},
    sleepHours = payload?.lifestyle?.sleep?.toString?.() || '',
    hydration = payload?.lifestyle?.hydration?.toString?.() || '',
    stressLevel = payload?.lifestyle?.stress?.toString?.() || '',
    travel = '',
    exerciseLevel = payload?.lifestyle?.exercise || '',
    dietChanges = '',
    illnessExposure = payload?.lifestyle?.recent_illness_exposure || '',
    alcoholUse = '',
    drugUse = '',
    sexualActivity = '',
    menstrualCycle = '',
    chronicConditions = Array.isArray(payload?.lifestyle?.chronic_conditions)
      ? payload?.lifestyle?.chronic_conditions
      : payload?.lifestyle?.chronic_conditions
      ? String(payload.lifestyle.chronic_conditions).split(',').map((v: string) => v.trim()).filter(Boolean)
      : [],
    medications = Array.isArray(payload?.lifestyle?.medications)
      ? payload?.lifestyle?.medications
      : payload?.lifestyle?.medications
      ? String(payload.lifestyle.medications).split(',').map((v: string) => v.trim()).filter(Boolean)
      : [],
  } = body || {}

  if (!symptoms || typeof symptoms !== 'string') {
    return res.status(400).json({ error: 'Symptoms description is required' })
  }

  const supabase = createPagesServerClient<Database>({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Runtime validation: ensure API key is still available
  if (!process.env.GROQ_API_KEY) {
    console.error('ERROR: GROQ_API_KEY is missing at runtime!')
    return res.status(500).json({ error: 'Server configuration error: API key missing' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // ============================================
    // STEP 1: LLM INTERPRETER
    // ============================================
    const prompt = `Convert the user's report and provided context into this exact JSON format:

{
  "symptoms": string[],
  "severity": "mild" | "moderate" | "severe" | "extremely severe",
  "duration": string,
  "risk_factors": string[],
  "recommended_specialist": string, // always include; choose the most relevant specialist (e.g., cardiology, neurology, pulmonology, GI, psychiatry, dermatology, family medicine)
  "medical_history": string[],
  "lifestyle": string[],
  "symptom_onset": string,
  "followup_questions": string[],
  "followup_answers": object,
  "sleep_hours": string,
  "hydration_level": string,
  "stress_level": string,
  "recent_travel": string,
  "exercise_level": string,
  "diet_changes": string,
  "recent_illness_exposure": string,
  "alcohol_use": string,
  "drug_use": string,
  "sexual_activity": string,
  "menstrual_cycle": string,
  "chronic_conditions": string[],
  "current_medications": string[]
}

Rules:
- Factor lifestyle/info into severity/urgency: smoking/drug use + cardiac symptoms -> higher urgency; dehydration + vomiting -> higher severity; recent travel -> higher infection risk; chronic conditions/medications should influence recommendations.
- ALWAYS pick a recommended_specialist based on the presentation. If uncertain, default to "family medicine".
- Only return valid JSON. No extra text.

User report:
${symptoms}

Provided patient context (use in severity/urgency and recommendations):
Medical history: ${medicalHistory.join(', ') || 'None'}
Lifestyle factors: ${lifestyle.join(', ') || 'None'}
Symptom timeline: ${onset}
Sleep: ${sleepHours}, Hydration: ${hydration}, Stress: ${stressLevel}, Travel: ${travel}, Exercise: ${exerciseLevel}, Diet changes: ${dietChanges}, Illness exposure: ${illnessExposure}
Alcohol: ${alcoholUse}, Drugs: ${drugUse}, Sexual activity: ${sexualActivity}, Menstrual cycle: ${menstrualCycle}, Chronic conditions: ${chronicConditions.join(', ') || 'None'}, Medications: ${medications.join(', ') || 'None'}
Follow-up answers: ${JSON.stringify(followUpAnswers)}
`

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

    if (!structuredOutput.recommended_specialist || typeof structuredOutput.recommended_specialist !== 'string') {
      structuredOutput.recommended_specialist = 'family medicine'
      debugLogs.push("recommended_specialist missing; applied default = 'family medicine'.")
    } else {
      structuredOutput.recommended_specialist = structuredOutput.recommended_specialist.trim() || 'family medicine'
    }

    // Merge provided patient context to ensure availability
    structuredOutput.medical_history = Array.isArray(medicalHistory)
      ? medicalHistory
      : structuredOutput.medical_history || []
    structuredOutput.lifestyle = Array.isArray(lifestyle)
      ? lifestyle
      : structuredOutput.lifestyle || []
    structuredOutput.symptom_onset =
      typeof onset === 'string' && onset ? onset : structuredOutput.symptom_onset || ''
    structuredOutput.followup_questions =
      (Array.isArray(followUpQuestions) && followUpQuestions.length > 0
        ? followUpQuestions
        : structuredOutput.followup_questions) || []
    structuredOutput.followup_answers =
      (followUpAnswers && typeof followUpAnswers === 'object' && Object.keys(followUpAnswers).length > 0
        ? followUpAnswers
        : structuredOutput.followup_answers) || {}
    structuredOutput.sleep_hours = structuredOutput.sleep_hours || (sleepHours as string)
    structuredOutput.hydration_level = structuredOutput.hydration_level || (hydration as string)
    structuredOutput.stress_level = structuredOutput.stress_level || (stressLevel as string)
    structuredOutput.recent_travel = structuredOutput.recent_travel || (travel as string)
    structuredOutput.exercise_level = structuredOutput.exercise_level || (exerciseLevel as string)
    structuredOutput.diet_changes = structuredOutput.diet_changes || (dietChanges as string)
    structuredOutput.recent_illness_exposure =
      structuredOutput.recent_illness_exposure || (illnessExposure as string)
    structuredOutput.alcohol_use = structuredOutput.alcohol_use || (alcoholUse as string)
    structuredOutput.drug_use = structuredOutput.drug_use || (drugUse as string)
    structuredOutput.sexual_activity = structuredOutput.sexual_activity || (sexualActivity as string)
    structuredOutput.menstrual_cycle = structuredOutput.menstrual_cycle || (menstrualCycle as string)
    structuredOutput.chronic_conditions =
      structuredOutput.chronic_conditions ||
      (Array.isArray(chronicConditions) ? chronicConditions : [])
    structuredOutput.current_medications =
      structuredOutput.current_medications ||
      (Array.isArray(medications) ? medications : [])

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
    const sourceMatches = matchSources(structuredOutput)
    if (sourceMatches.length > 0) {
      debugLogs.push(`Matched ${sourceMatches.length} clinical pattern(s) against curated sources.`)
    }

    // ============================================
    // NEXT STEPS GENERATOR
    // ============================================
    const nextSteps = generateNextSteps(structuredOutput, urgency)

    // FOLLOW-UP QUESTIONS/ANSWERS (derived + provided)
    const derivedFollowups = buildFollowupQuestions(symptoms)
    const combinedFollowups =
      Array.isArray(followUpQuestions) && followUpQuestions.length > 0
        ? followUpQuestions
        : derivedFollowups

    structuredOutput.medical_history = Array.isArray(medicalHistory) ? medicalHistory : []
    structuredOutput.lifestyle = Array.isArray(lifestyle) ? lifestyle : []
    structuredOutput.symptom_onset = typeof onset === 'string' ? onset : ''
    structuredOutput.followup_questions = combinedFollowups
    structuredOutput.followup_answers =
      followUpAnswers && typeof followUpAnswers === 'object' ? followUpAnswers : {}
    structuredOutput.sleep_hours = sleepHours
    structuredOutput.hydration_level = hydration
    structuredOutput.stress_level = stressLevel
    structuredOutput.recent_travel = travel
    structuredOutput.exercise_level = exerciseLevel
    structuredOutput.diet_changes = dietChanges
    structuredOutput.recent_illness_exposure = illnessExposure
    structuredOutput.alcohol_use = alcoholUse
    structuredOutput.drug_use = drugUse
    structuredOutput.sexual_activity = sexualActivity
    structuredOutput.menstrual_cycle = menstrualCycle
    structuredOutput.chronic_conditions = Array.isArray(chronicConditions) ? chronicConditions : []
    structuredOutput.current_medications = Array.isArray(medications) ? medications : []

    // ============================================
    // RAG RETRIEVAL
    // ============================================
    let ragSources: RetrievedSource[] = []
    try {
      const ragContext = `
${symptoms}
Medical history: ${structuredOutput.medical_history?.join(', ') || 'None'}
Lifestyle: ${structuredOutput.lifestyle?.join(', ') || 'None'}
Symptom timeline: ${structuredOutput.symptom_onset || 'Not specified'}
Sleep: ${structuredOutput.sleep_hours || 'Not specified'}
Hydration: ${structuredOutput.hydration_level || 'Not specified'}
Stress: ${structuredOutput.stress_level || 'Not specified'}
Recent travel: ${structuredOutput.recent_travel || 'Not specified'}
Exercise: ${structuredOutput.exercise_level || 'Not specified'}
Diet changes: ${structuredOutput.diet_changes || 'Not specified'}
Illness exposure: ${structuredOutput.recent_illness_exposure || 'Not specified'}
Alcohol use: ${structuredOutput.alcohol_use || 'Not specified'}
Drug use: ${structuredOutput.drug_use || 'Not specified'}
Sexual activity: ${structuredOutput.sexual_activity || 'Not specified'}
Menstrual cycle: ${structuredOutput.menstrual_cycle || 'Not specified'}
Risk factors: ${structuredOutput.risk_factors.join(', ')}
Severity: ${structuredOutput.severity}
Urgency: ${urgency}
Medications: ${structuredOutput.current_medications?.join(', ') || 'None'}
Chronic conditions: ${structuredOutput.chronic_conditions?.join(', ') || 'None'}
`
      ragSources = await retrieveRelevantSources(ragContext, 2)
      if (ragSources.length > 0) {
        debugLogs.push(`Retrieved ${ragSources.length} relevant clinical pattern(s) via RAG.`)
      }
    } catch (ragError) {
      console.warn('RAG retrieval failed (non-critical):', ragError)
      // Continue without RAG sources - don't break the main flow
    }

    // ============================================
    // FINAL RESPONSE
    // ============================================
    let responsePayload: AnalyzeResponse = {
      structured_output: structuredOutput,
      final_score: finalScore,
      urgency,
      recommended_action: recommendedAction,
      debug: debugLogs,
      sources: sourceMatches,
      rag_sources: ragSources,
      next_steps: nextSteps,
    }

    // Apply global rules
    responsePayload = await applyGlobalRules(
      supabase,
      { text: symptoms, structured: structuredOutput },
      responsePayload
    )

    // Apply user-specific rules (noop in this setup)
    responsePayload = await applyRulesForUser(
      user?.id,
      { text: symptoms, structured: structuredOutput },
      responsePayload,
      supabase
    )

    // Apply RAG suppression based on global rules only
    try {
      const suppressRules: any[] = []
      const { data: globalRules } = await supabase.from('global_ai_rules').select('*')
      if (globalRules) suppressRules.push(...(globalRules as any[]))
      responsePayload.rag_sources = applyRagSuppression(responsePayload.rag_sources || [], suppressRules as any)
    } catch (e) {
      console.warn('RAG suppression skipped due to fetch error', e)
    }

    if (user) {
      try {
        await supabase.from('health_queries').insert({
          user_id: user.id,
          input_text: symptoms,
          structured_output: responsePayload,
        })
      } catch (insertError) {
        console.error('Failed to save history entry:', insertError)
      }
    }

    return res.status(200).json(responsePayload)
  } catch (error) {
    console.error('Error in analyze endpoint:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

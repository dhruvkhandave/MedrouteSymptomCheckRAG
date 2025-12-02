import { useMemo, useState } from 'react'
import Head from 'next/head'

import { Step1 } from '@/components/intake/Step1'
import { Step2 } from '@/components/intake/Step2'
import { Step3 } from '@/components/intake/Step3'

import type { AnalyzeResponse, RetrievedSource, SourceMatch } from '@/lib/types'

export default function AnalyzePage() {
  const [step, setStep] = useState(1)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [symptomTimeline, setSymptomTimeline] = useState('')
  const [medicalHistory, setMedicalHistory] = useState<string[]>([])
  const [lifestyle, setLifestyle] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [hydration, setHydration] = useState('')
  const [stressLevel, setStressLevel] = useState('')
  const [travel, setTravel] = useState('')
  const [exerciseLevel, setExerciseLevel] = useState('')
  const [dietChanges, setDietChanges] = useState('')
  const [illnessExposure, setIllnessExposure] = useState('')
  const [alcoholUse, setAlcoholUse] = useState('')
  const [drugUse, setDrugUse] = useState('')
  const [sexualActivity, setSexualActivity] = useState('')
  const [menstrualCycle, setMenstrualCycle] = useState('')
  const [chronicConditions, setChronicConditions] = useState<string[]>([])
  const [medications, setMedications] = useState<string[]>([])
  const [followUps, setFollowUps] = useState<string[]>([])
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [view, setView] = useState<'doctor' | 'json'>('doctor')
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [localStep, setLocalStep] = useState(1)
  const [providerZip, setProviderZip] = useState('')
  const [providers, setProviders] = useState<
    Array<{ name: string; practiceName?: string | null; address: string; phone?: string }>
  >([])
  const [providersLoading, setProvidersLoading] = useState(false)
  const [providersError, setProvidersError] = useState<string | null>(null)

  const handleGenerateFollowUps = () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms')
      return
    }

    const questions = buildFollowupQuestions(symptoms)
    setFollowUps(questions.length ? questions : ['Are the symptoms getting better, worse, or staying the same?'])
    setError(null)
  }

  const handleAnalyzeFlow = async () => {
    if (!acknowledged) return
    setLoading(true)
    setError(null)
    setResult(null)

    const fullText = `
Medical History: ${medicalHistory.length ? medicalHistory.join(', ') : 'None'}
Lifestyle Factors: ${lifestyle.length ? lifestyle.join(', ') : 'None'}
Symptom Timeline: ${symptomTimeline || 'Not specified'}
Sleep Hours: ${sleepHours || 'Not specified'}
Hydration: ${hydration || 'Not specified'}
Stress Level: ${stressLevel || 'Not specified'}
Recent Travel: ${travel || 'Not specified'}
Exercise Level: ${exerciseLevel || 'Not specified'}
Diet Changes: ${dietChanges || 'Not specified'}
Recent Illness Exposure: ${illnessExposure || 'Not specified'}
Alcohol Use: ${alcoholUse || 'Not specified'}
Drug Use: ${drugUse || 'Not specified'}
Sexual Activity: ${sexualActivity || 'Not specified'}
Menstrual Cycle: ${menstrualCycle || 'Not specified'}
Chronic Conditions: ${chronicConditions.length ? chronicConditions.join(', ') : 'None'}
Current Medications: ${medications.length ? medications.join(', ') : 'None'}
Age: ${age}
Sex: ${gender}
Symptom Description: ${symptoms}
Follow-up: ${JSON.stringify(followUpAnswers)}
    `.trim()

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: fullText,
          medicalHistory,
          lifestyle,
          onset: symptomTimeline,
          followUpQuestions: followUps,
          followUpAnswers,
          sleepHours,
          hydration,
          stressLevel,
          travel,
          exerciseLevel,
          dietChanges,
          illnessExposure,
          alcoholUse,
          drugUse,
          sexualActivity,
          menstrualCycle,
          chronicConditions,
          medications,
        }),
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
    if (!symptoms.trim() || !acknowledged) {
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
        body: JSON.stringify({
          symptoms,
          medicalHistory,
          lifestyle,
          onset: symptomTimeline,
          followUpQuestions: followUps,
          followUpAnswers,
          sleepHours,
          hydration,
          stressLevel,
          travel,
          exerciseLevel,
          dietChanges,
          illnessExposure,
          alcoholUse,
          drugUse,
          sexualActivity,
          menstrualCycle,
          chronicConditions,
          medications,
        }),
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

  const toggleCheckbox = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    )
  }

  const toggleMultiValue = (value: string, list: string[], setter: (v: string[]) => void) =>
    toggleCheckbox(value, list, setter)

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
    match: ['cough', 'fever', 'congestion', 'wheezing'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Are you experiencing difficulty breathing?',
      'Is the cough productive (mucus)?',
      'Have you had recent exposure to someone sick?'
    ],
  },

  // Abdominal pain / GI
  {
    match: ['abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'cramping', 'bloating'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Does eating make symptoms better or worse?',
      'Have you had any recent meals that seemed unusual or spoiled?',
      'Are you able to keep fluids down?'
    ],
  },

  // Fever / chills / infection
  {
    match: ['fever', 'chills', 'fatigue'].some((t) => lower.includes(t)),
    questions: [
      'Have symptoms worsened over the last 24 hours?',
      'Any recent travel or exposure to sick contacts?'
    ],
  },

  // Allergic reaction / hives
  {
    match: ['hives', 'swelling', 'rash', 'itching'].some((t) => lower.includes(t)),
    questions: [
      'Did you recently eat or take anything new?',
      'Are symptoms getting worse quickly?',
      'Any swelling of lips, face, or throat?'
    ],
  },

  // Neurological symptoms
  {
    match: ['headache', 'migraine', 'dizziness', 'numbness', 'weakness', 'vision changes'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Did the headache start suddenly or gradually?',
      'Are you experiencing vision changes or double vision?',
      'Any numbness or weakness on one side of your body?',
      'Is this the worst headache you have ever had?'
    ],
  },

  // Stroke-like symptoms
  {
    match: ['slurred speech', 'drooping', 'paralysis', 'confusion'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Is one side of the face or body weaker than the other?',
      'Are you having trouble speaking or understanding speech?',
      'Did symptoms begin very suddenly?'
    ],
  },

  // Ear / sinus / throat infections
  {
    match: ['ear pain', 'sinus pressure', 'sore throat', 'post nasal drip'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Do you have difficulty swallowing?',
      'Any discharge from the ear or nose?',
      'Is the sore throat worse when swallowing?'
    ],
  },

  // Musculoskeletal pain
  {
    match: ['back pain', 'joint pain', 'muscle pain', 'spasm'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Was there a recent injury or sudden movement?',
      'Does rest improve the pain?',
      'Any numbness or tingling down your legs or arms?'
    ],
  },

  // Urinary / kidney
  {
    match: ['flank pain', 'burning urination', 'blood in urine', 'frequent urination'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Do you have fever or chills?',
      'Is the pain on one side of your back?',
      'Any nausea or vomiting along with the pain?'
    ],
  },

  // Liver / gallbladder
  {
    match: ['yellow skin', 'yellow eyes', 'upper right abdominal pain', 'greasy stools'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Is the pain worse after eating fatty foods?',
      'Have you noticed dark urine?',
      'Any nausea after meals?'
    ],
  },

  // Dehydration
  {
    match: ['dry mouth', 'dark urine', 'thirst', 'lightheaded'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'How much water have you had today?',
      'Are you able to keep fluids down?',
      'Any dizziness when standing up?'
    ],
  },

  // Blood sugar / endocrine
  {
    match: ['thirsty', 'urinating a lot', 'blurry vision', 'shaky'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Have you checked your blood sugar recently?',
      'Are you experiencing nausea or abdominal pain?',
      'Any fruity-smelling breath?'
    ],
  },

  // Pregnancy
  {
    match: ['missed period', 'pregnant', 'positive test', 'pelvic pain'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'When was your last menstrual period?',
      'Any abdominal cramping or bleeding?',
      'Any dizziness or fainting?'
    ],
  },

  // Skin infection
  {
    match: ['cellulitis', 'skin redness', 'warm skin', 'boil', 'abscess'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Is the area warm, swollen, or painful?',
      'Is the redness spreading?',
      'Do you have fever?'
    ],
  },

  // Eye symptoms
  {
    match: ['red eye', 'eye pain', 'blurred vision', 'tearing'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Is your vision blurred or cloudy?',
      'Any sensitivity to light?',
      'Was there an injury or foreign object in the eye?'
    ],
  },

  // Anemia / low blood count
  {
    match: ['fatigue', 'pale skin', 'short of breath on exertion'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Have you noticed increased fatigue recently?',
      'Any dizziness or lightheadedness?',
      'Any heavy menstrual bleeding (if applicable)?'
    ],
  },

  // Poisoning / toxin exposure
  {
    match: ['chemical smell', 'metallic taste', 'exposure', 'poison'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Did you recently handle chemicals or fumes?',
      'Any vomiting or confusion?',
      'Did symptoms begin shortly after exposure?'
    ],
  },

  // Gout / inflammation
  {
    match: ['swollen big toe', 'hot joint', 'sharp joint pain'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Is the joint red, warm, or swollen?',
      'Did the pain start suddenly overnight?',
      'Have you eaten red meat or alcohol recently?'
    ],
  },

  // Severe infection / sepsis red flags
  {
    match: ['high fever', 'rapid heartbeat', 'confusion', 'shivering'].some((t) =>
      lower.includes(t)
    ),
    questions: [
      'Are you feeling unusually confused or drowsy?',
      'Is your heart rate faster than normal?',
      'Have symptoms progressed rapidly?'
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

  const canNext = useMemo(() => {
    if (localStep === 1) return age.trim() !== '' && gender.trim() !== ''
    if (localStep === 2) return true
    if (localStep === 3) return symptoms.trim() !== '' && acknowledged
    return false
  }, [localStep, age, gender, symptoms, acknowledged])

  return (
    <>
      <Head>
        <title>Analyze | MedRoute</title>
        <meta name="description" content="Healthcare symptom analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 bg-indigo-300/30 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute top-24 -right-10 h-72 w-72 bg-purple-300/30 blur-3xl rounded-full" />
        {showDisclaimer && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Important Notice</h2>
              <p className="text-sm text-gray-700 mb-4">
                By using this tool you acknowledge this is NOT medical advice and is only informational.
              </p>
              <button
                onClick={() => {
                  setAcknowledged(true)
                  setShowDisclaimer(false)
                }}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                I Understand
              </button>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto relative">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MedRoute</h1>
            <p className="text-gray-600">Healthcare symptom analysis with AI-powered triage</p>
            <p className="text-xs text-gray-400 mt-3 font-light">by Dhruv Khandave</p>
          </div>

          {step !== 3 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Step {localStep} of 3</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => localStep > 1 && setLocalStep(localStep - 1)}
                    disabled={localStep === 1}
                    className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (localStep === 1) {
                        setLocalStep(2)
                      } else if (localStep === 2) {
                        if (followUps.length === 0) {
                          handleGenerateFollowUps()
                        } else {
                          setLocalStep(3)
                        }
                      } else {
                        handleAnalyzeFlow()
                      }
                    }}
                    disabled={
                      (localStep === 1 && (!age.trim() || !gender.trim())) ||
                      (localStep === 2 && (!symptoms.trim())) ||
                      (localStep === 3 && (!acknowledged || !symptoms.trim()))
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      localStep === 3 ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'
                    } disabled:opacity-60`}
                  >
                    {localStep === 3 ? 'Analyze' : 'Next'}
                  </button>
                </div>
              </div>

              {localStep === 1 && (
                <Step1 age={age} gender={gender} onAgeChange={setAge} onGenderChange={setGender} />
              )}

              {localStep === 2 && (
                <Step3
                  symptomTimeline={symptomTimeline}
                  symptoms={symptoms}
                  followUps={followUps}
                  followUpAnswers={followUpAnswers}
                  showFollowupsOnly={followUps.length > 0}
                  onTimelineChange={setSymptomTimeline}
                  onSymptomsChange={setSymptoms}
                  onFollowUpAnswer={(q, a) => setFollowUpAnswers((prev) => ({ ...prev, [q]: a }))}
                />
              )}

              {localStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50 text-sm text-indigo-900">
                    These details are optional but help the AI and RAG context tailor guidance more accurately.
                  </div>
                  <Step2
                    symptomTimeline={symptomTimeline}
                    medicalHistory={medicalHistory}
                    lifestyle={lifestyle}
                    sleepHours={sleepHours}
                    hydration={hydration}
                    exerciseLevel={exerciseLevel}
                    stressLevel={stressLevel}
                    travel={travel}
                    dietChanges={dietChanges}
                    illnessExposure={illnessExposure}
                    alcoholUse={alcoholUse}
                    drugUse={drugUse}
                    sexualActivity={sexualActivity}
                    menstrualCycle={menstrualCycle}
                    chronicConditions={chronicConditions}
                    medications={medications}
                    onTimelineChange={setSymptomTimeline}
                    onToggleMedical={(item) => toggleCheckbox(item, medicalHistory, setMedicalHistory)}
                    onToggleLifestyle={(item) => toggleCheckbox(item, lifestyle, setLifestyle)}
                    onSleepChange={setSleepHours}
                    onHydrationChange={setHydration}
                    onExerciseChange={setExerciseLevel}
                    onStressChange={setStressLevel}
                    onTravelChange={setTravel}
                    onDietChange={setDietChanges}
                    onIllnessExposureChange={setIllnessExposure}
                    onAlcoholChange={setAlcoholUse}
                    onDrugUseChange={setDrugUse}
                    onSexualActivityChange={setSexualActivity}
                    onMenstrualCycleChange={setMenstrualCycle}
                    onChronicChange={setChronicConditions}
                    onMedicationsChange={setMedications}
                  />
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <div className="bg-white/90 border border-gray-100 rounded-2xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Your Analysis Summary</h2>
                <button
                  onClick={() => {
                    setStep(1)
                    setLocalStep(1)
                    setResult(null)
                    setAge('')
                    setGender('')
                    setSymptomTimeline('')
                    setSleepHours('')
                    setHydration('')
                    setStressLevel('')
                    setTravel('')
                    setExerciseLevel('')
                    setDietChanges('')
                    setIllnessExposure('')
                    setAlcoholUse('')
                    setDrugUse('')
                    setSexualActivity('')
                    setMenstrualCycle('')
                    setChronicConditions([])
                    setMedications([])
                    setSymptoms('')
                    setFollowUps([])
                    setFollowUpAnswers({})
                    setProviderZip('')
                    setProviders([])
                    setProvidersError(null)
                    setProvidersLoading(false)
                  }}
                  className="text-sm text-indigo-700 hover:text-indigo-900 border border-indigo-200 bg-indigo-50 px-3 py-2 rounded-lg font-medium transition-colors"
                >
                  Start New Analysis
                </button>
              </div>

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
                  Detailed View
                </button>
                <button
                  onClick={() => setView('json')}
                  className={`pb-3 px-1 font-medium transition-colors ${
                    view === 'json'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Raw Data
                </button>
              </div>

              {/* Detailed View */}
              {view === 'doctor' && (
                <div className="space-y-6">
                  {/* Patient Info */}
                  {(age || gender || symptomTimeline || result.structured_output) && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Patient Info</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-800">
                        {age && <div><span className="font-medium text-gray-600">Age:</span> {age}</div>}
                        {gender && <div><span className="font-medium text-gray-600">Gender:</span> <span className="capitalize">{gender}</span></div>}
                        {symptomTimeline && <div><span className="font-medium text-gray-600">Timeline:</span> {symptomTimeline}</div>}
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Symptoms</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-900">
                      {result.structured_output.symptoms.map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Severity & Urgency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Recommended Action */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Recommended Action</div>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                      <div className="text-indigo-900">{result.recommended_action}</div>
                    </div>
                  </div>

                  {/* Recommended Providers Nearby */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                          Recommended Providers Nearby
                        </div>
                        <div className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 mt-1">
                          <span className="font-semibold">AI recommendation:</span>
                          <span>
                            {result.structured_output.recommended_specialist || 'family medicine'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Enter a ZIP code to find{' '}
                          {result.structured_output.recommended_specialist
                            ? `${result.structured_output.recommended_specialist} providers`
                            : 'family medicine providers'} near you.
                        </p>
                        {!result.structured_output.recommended_specialist && (
                          <p className="text-xs text-amber-600 mt-1">
                            Specialist type not provided; defaulting to family medicine.
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={providerZip}
                          onChange={(e) => setProviderZip(e.target.value)}
                          placeholder="ZIP code"
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={async () => {
                            if (!providerZip.trim()) {
                              setProvidersError('Please enter a ZIP code')
                              return
                            }
                            const providerType =
                              result.structured_output.recommended_specialist || 'family medicine'
                            setProvidersError(null)
                            setProviders([])
                            setProvidersLoading(true)
                            try {
                              const response = await fetch('/api/providers', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  providerType,
                                  zip: providerZip.trim(),
                                }),
                              })
                              if (!response.ok) {
                                const data = await response.json().catch(() => ({}))
                                throw new Error(data.error || 'Unable to fetch providers')
                              }
                              const data = await response.json()
                              setProviders(data)
                            } catch (err) {
                              setProvidersError(err instanceof Error ? err.message : 'Unable to fetch providers')
                            } finally {
                              setProvidersLoading(false)
                            }
                          }}
                          disabled={providersLoading}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {providersLoading
                            ? 'Searching...'
                            : `Find nearby ${
                                result.structured_output.recommended_specialist
                                  ? `${result.structured_output.recommended_specialist} providers`
                                  : 'family medicine providers'
                              }`}
                        </button>
                      </div>
                    </div>
                    {providersError && (
                      <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                        {providersError}
                      </div>
                    )}
                    <div className="mt-4 space-y-3">
                      {providersLoading && <div className="text-sm text-gray-600">Searching providers...</div>}
                      {!providersLoading && providers.length === 0 && !providersError && (
                        <div className="text-sm text-gray-600">No providers found near this ZIP code.</div>
                      )}
                      {providers.map((p, idx) => (
                        <div
                          key={`${p.name}-${idx}`}
                          className="border border-gray-200 rounded-lg p-4 flex flex-col gap-1"
                        >
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          {p.practiceName && <div className="text-sm text-gray-700">{p.practiceName}</div>}
                          <div className="text-sm text-gray-700">{p.address}</div>
                          {p.phone && <div className="text-xs text-gray-600">Phone: {p.phone}</div>}
                        </div>
                      ))}
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

                  {/* Severity Rationale */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                        Severity Rationale
                      </h3>
                      {typeof result.final_score === 'number' && (
                        <span className="text-xs text-gray-500">
                          Triage score: {result.final_score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      The AI assessed severity as <span className="font-semibold">{result.structured_output.severity}</span> and urgency as{' '}
                      <span className="font-semibold">{result.urgency}</span> based on the factors below.
                    </p>
                    {result.structured_output.risk_factors && result.structured_output.risk_factors.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-gray-800">
                        {result.structured_output.risk_factors.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-gray-600">No specific risk factors were surfaced.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Raw Data */}
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

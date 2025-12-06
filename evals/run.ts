import fs from 'fs/promises'
import path from 'path'

type EvalCase = {
  id: string
  input_text: string
  expected: {
    recommended_action: string
    recommended_specialist: string
  }
}

const bucketAction = (text: string): string => {
  const t = text.toLowerCase()
  if (t.includes('emergency') || t.includes('immediate')) return 'emergency'
  if (t.includes('urgent')) return 'urgent'
  if (t.includes('24-48') || t.includes('clinic') || t.includes('schedule')) return 'clinic'
  if (t.includes('monitor') || t.includes('rest') || t.includes('home')) return 'home'
  return 'other'
}

const normalizeSpecialist = (text: string): string => text.toLowerCase().replace(/[^a-z]/g, '')

async function main() {
  const casesPath = path.join(process.cwd(), 'evals', 'cases.json')
  const raw = await fs.readFile(casesPath, 'utf8')
  const cases: EvalCase[] = JSON.parse(raw)

  let passed = 0

  for (const testCase of cases) {
    const body = {
      symptoms: testCase.input_text,
      medicalHistory: [],
      lifestyle: [],
      onset: 'not specified',
      followUpQuestions: [],
      followUpAnswers: {},
      sleepHours: '',
      hydration: '',
      stressLevel: '',
      travel: '',
      exerciseLevel: '',
      dietChanges: '',
      illnessExposure: '',
      alcoholUse: '',
      drugUse: '',
      sexualActivity: '',
      menstrualCycle: '',
      chronicConditions: [],
      medications: [],
    }

    try {
      const resp = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!resp.ok) {
        console.log(`Case ${testCase.id}: ERROR (${resp.status})`)
        continue
      }

      const data = await resp.json()
      const predictedAction = data?.recommended_action || ''
      const predictedSpecialist = data?.structured_output?.recommended_specialist || ''

      const actionMatch =
        bucketAction(predictedAction) === bucketAction(testCase.expected.recommended_action)
      const specialistMatch =
        normalizeSpecialist(predictedSpecialist) === normalizeSpecialist(testCase.expected.recommended_specialist)
      const pass = actionMatch && specialistMatch
      if (pass) passed += 1

      console.log(`Case ${testCase.id}:`)
      console.log(`  expected: ${testCase.expected.recommended_action} / ${testCase.expected.recommended_specialist}`)
      console.log(`  predicted: ${predictedAction} / ${predictedSpecialist}`)
      console.log(`  ${pass ? 'PASS' : 'FAIL'}`)
      console.log('')
    } catch (err) {
      console.log(`Case ${testCase.id}: ERROR (${(err as Error).message})`)
    }
  }

  const total = cases.length
  const accuracy = total > 0 ? (passed / total) * 100 : 0
  console.log(`Summary: ${passed}/${total} correct (${accuracy.toFixed(1)} percent)`)
}

main().catch((err) => {
  console.error('Eval run failed:', err)
  process.exit(1)
})

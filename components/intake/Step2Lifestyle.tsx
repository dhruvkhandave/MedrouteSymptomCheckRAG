interface Step2LifestyleProps {
  sleep: number
  hydration: number
  stress: number
  exercise: string
  chronicConditions: string
  medications: string
  onSleepChange: (v: number) => void
  onHydrationChange: (v: number) => void
  onStressChange: (v: number) => void
  onExerciseChange: (v: string) => void
  onChronicChange: (v: string) => void
  onMedicationsChange: (v: string) => void
}

export function Step2Lifestyle({
  sleep,
  hydration,
  stress,
  exercise,
  chronicConditions,
  medications,
  onSleepChange,
  onHydrationChange,
  onStressChange,
  onExerciseChange,
  onChronicChange,
  onMedicationsChange,
}: Step2LifestyleProps) {
  const sliderCls = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sleep (hours, 1–10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={sleep}
            onChange={(e) => onSleepChange(Number(e.target.value))}
            className={sliderCls}
          />
          <div className="text-sm text-gray-700 mt-1">{sleep} hours</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hydration (1–10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={hydration}
            onChange={(e) => onHydrationChange(Number(e.target.value))}
            className={sliderCls}
          />
          <div className="text-sm text-gray-700 mt-1">{hydration}/10</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stress (1–10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={stress}
            onChange={(e) => onStressChange(Number(e.target.value))}
            className={sliderCls}
          />
          <div className="text-sm text-gray-700 mt-1">{stress}/10</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Exercise frequency</label>
          <select
            value={exercise}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select</option>
            <option value="none">None</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chronic conditions</label>
          <input
            type="text"
            value={chronicConditions}
            onChange={(e) => onChronicChange(e.target.value)}
            placeholder="e.g., hypertension, diabetes"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current medications</label>
        <input
          type="text"
          value={medications}
          onChange={(e) => onMedicationsChange(e.target.value)}
          placeholder="e.g., lisinopril, metformin"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

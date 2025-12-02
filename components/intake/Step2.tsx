interface Step2Props {
  symptomTimeline: string
  medicalHistory: string[]
  lifestyle: string[]
  sleepHours: string
  hydration: string
  exerciseLevel: string
  stressLevel: string
  travel: string
  dietChanges: string
  illnessExposure: string
  alcoholUse: string
  drugUse: string
  sexualActivity: string
  menstrualCycle: string
  chronicConditions: string[]
  medications: string[]
  onTimelineChange: (v: string) => void
  onToggleMedical: (item: string) => void
  onToggleLifestyle: (item: string) => void
  onSleepChange: (v: string) => void
  onHydrationChange: (v: string) => void
  onExerciseChange: (v: string) => void
  onStressChange: (v: string) => void
  onTravelChange: (v: string) => void
  onDietChange: (v: string) => void
  onIllnessExposureChange: (v: string) => void
  onAlcoholChange: (v: string) => void
  onDrugUseChange: (v: string) => void
  onSexualActivityChange: (v: string) => void
  onMenstrualCycleChange: (v: string) => void
  onChronicChange: (v: string[]) => void
  onMedicationsChange: (v: string[]) => void
}

export function Step2({
  symptomTimeline: _symptomTimeline,
  medicalHistory,
  lifestyle,
  sleepHours,
  hydration,
  exerciseLevel,
  stressLevel,
  travel: _travel,
  dietChanges,
  illnessExposure: _illnessExposure,
  alcoholUse,
  drugUse,
  sexualActivity: _sexualActivity,
  menstrualCycle: _menstrualCycle,
  chronicConditions: _chronicConditions,
  medications,
  onTimelineChange: _onTimelineChange,
  onToggleMedical,
  onToggleLifestyle,
  onSleepChange,
  onHydrationChange,
  onExerciseChange,
  onStressChange,
  onTravelChange: _onTravelChange,
  onDietChange,
  onIllnessExposureChange: _onIllnessExposureChange,
  onAlcoholChange,
  onDrugUseChange,
  onSexualActivityChange: _onSexualActivityChange,
  onMenstrualCycleChange: _onMenstrualCycleChange,
  onChronicChange: _onChronicChange,
  onMedicationsChange,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Medical History</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['Heart disease', 'Asthma', 'Diabetes', 'High blood pressure', 'Thyroid disorder', 'Anxiety / panic attacks', 'No known conditions'].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={medicalHistory.includes(item)}
                  onChange={() => onToggleMedical(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Lifestyle / Risk Factors</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['Smoker', 'Drinks alcohol', 'Recently traveled', 'Heavy exercise', 'Poor sleep / high stress'].map((item) => (
              <label key={item} className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={lifestyle.includes(item)}
                  onChange={() => onToggleLifestyle(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sleep hours (Avg: 0-12)</label>
          <input
            type="range"
            min={0}
            max={12}
            value={Number(sleepHours || 0)}
            onChange={(e) => onSleepChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-700 mt-1">{sleepHours || 0} hrs</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hydration (0-10)</label>
          <input
            type="range"
            min={0}
            max={10}
            value={Number(hydration || 0)}
            onChange={(e) => onHydrationChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-700 mt-1">{hydration || 0}/10</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exercise level (Days per week)</label>
          <input
            type="range"
            min={0}
            max={7}
            value={Number(exerciseLevel || 0)}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-700 mt-1">{exerciseLevel || 0} / 7</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stress level</label>
          <input
            type="text"
            value={stressLevel}
            onChange={(e) => onStressChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., high, moderate"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diet changes</label>
          <input
            type="text"
            value={dietChanges}
            onChange={(e) => onDietChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., new diet/food"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol use</label>
          <input
            type="text"
            value={alcoholUse}
            onChange={(e) => onAlcoholChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., occasional / frequent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Drug use</label>
          <input
            type="text"
            value={drugUse}
            onChange={(e) => onDrugUseChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., none / type / frequency"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current medications</label>
        <input
          type="text"
          value={medications.join(', ')}
          onChange={(e) =>
            onMedicationsChange(
              e.target.value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Comma separated     Ex: drug1,drug2"
        />
      </div>
    </div>
  )
}

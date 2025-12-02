interface FollowUpQA {
  question: string
  answer: string
}

interface Step3SymptomsProps {
  symptoms: string
  onSymptomsChange: (v: string) => void
  followUps: string[]
  followUpAnswers: Record<string, string>
  onFollowUpAnswer: (q: string, a: string) => void
  severity: number
  progression: string
  onSeverityChange: (v: number) => void
  onProgressionChange: (v: string) => void
}

export function Step3Symptoms({
  symptoms,
  onSymptomsChange,
  followUps,
  followUpAnswers,
  onFollowUpAnswer,
  severity,
  progression,
  onSeverityChange,
  onProgressionChange,
}: Step3SymptomsProps) {
  const sliderCls = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Describe your symptoms</label>
        <textarea
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="e.g., chest pain radiating to jaw, shortness of breath..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity (1–10)</label>
          <input
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => onSeverityChange(Number(e.target.value))}
            className={sliderCls}
          />
          <div className="text-sm text-gray-700 mt-1">{severity}/10</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Progression</label>
          <select
            value={progression}
            onChange={(e) => onProgressionChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select</option>
            <option value="better">Getting better</option>
            <option value="worse">Getting worse</option>
            <option value="same">About the same</option>
          </select>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-gray-800 mb-2">Follow-up Responses</div>
        {followUps.length === 0 ? (
          <div className="text-sm text-gray-600">No follow-ups detected yet.</div>
        ) : (
          <div className="space-y-3">
            {followUps.map((q) => (
              <div key={q} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-800">{q}</div>
                <input
                  type="text"
                  value={followUpAnswers[q] || ''}
                  onChange={(e) => onFollowUpAnswer(q, e.target.value)}
                  placeholder="Your answer"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

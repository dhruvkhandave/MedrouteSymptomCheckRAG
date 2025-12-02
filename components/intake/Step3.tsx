interface Step3Props {
  symptomTimeline: string
  symptoms: string
  followUps: string[]
  followUpAnswers: Record<string, string>
  showFollowupsOnly: boolean
  onTimelineChange: (v: string) => void
  onSymptomsChange: (v: string) => void
  onFollowUpAnswer: (q: string, a: string) => void
}

export function Step3({
  symptomTimeline,
  symptoms,
  followUps,
  followUpAnswers,
  showFollowupsOnly,
  onTimelineChange,
  onSymptomsChange,
  onFollowUpAnswer,
}: Step3Props) {
  return (
    <div className="space-y-6">
      {!showFollowupsOnly && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptom Timeline / Duration
            </label>
            <input
              type="text"
              value={symptomTimeline}
              onChange={(e) => onTimelineChange(e.target.value)}
              placeholder="e.g., 3 days, worsening"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe your symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => onSymptomsChange(e.target.value)}
              placeholder="e.g., chest pain radiating to jaw, shortness of breath..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={4}
            />
          </div>
        </>
      )}

      <div className="space-y-4">
        {followUps.map((q, idx) => (
          <div key={idx}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {q}
            </label>
            <input
              type="text"
              placeholder="Your answer"
              value={followUpAnswers[q] || ''}
              onChange={(e) => onFollowUpAnswer(q, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

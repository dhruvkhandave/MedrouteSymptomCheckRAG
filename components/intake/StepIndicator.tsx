import clsx from 'clsx'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((label, idx) => {
        const stepNumber = idx + 1
        const active = stepNumber === currentStep
        const completed = stepNumber < currentStep
        return (
          <div key={label} className="flex-1 flex items-center">
            <div
              className={clsx(
                'h-10 w-10 flex items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                active
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : completed
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-white text-gray-500 border-gray-200'
              )}
            >
              {stepNumber}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{label}</div>
              {active && <div className="text-xs text-indigo-600">In progress</div>}
            </div>
            {idx !== steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-200 ml-3 mr-3" aria-hidden />
            )}
          </div>
        )
      })}
    </div>
  )
}

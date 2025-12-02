interface Step1Props {
  age: string
  gender: string
  onAgeChange: (v: string) => void
  onGenderChange: (v: string) => void
}

export function Step1({ age, gender, onAgeChange, onGenderChange }: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
          placeholder="Enter your age"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <select
          value={gender}
          onChange={(e) => onGenderChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  )
}

import { useRef, useState } from 'react'

interface Step4DocumentsProps {
  sessionId: string
  onUploadComplete: (charCount: number, preview: string) => void
}

export function Step4Documents({ sessionId, onUploadComplete }: Step4DocumentsProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [preview, setPreview] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [filename, setFilename] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/docs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64, filename: file.name, session_id: sessionId }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')

      setPreview(data.preview)
      setCharCount(data.char_count)
      setFilename(file.name)
      setUploaded(true)
      onUploadComplete(data.char_count, data.preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50 text-sm text-indigo-900">
        Upload a medical document to improve the accuracy of AI recommendations and Reference Patterns.
        Lab results, discharge summaries, and prior diagnoses work best.{' '}
        <span className="font-medium">This step is optional — you can skip it.</span>
      </div>

      {!uploaded ? (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            uploading
              ? 'border-indigo-300 bg-indigo-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3 text-indigo-600">
              <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium">Extracting and embedding document…</span>
              <span className="text-xs text-indigo-400">This takes a few seconds</span>
            </div>
          ) : (
            <div className="text-gray-500">
              <svg className="mx-auto h-10 w-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Click to upload a PDF</p>
              <p className="text-xs text-gray-400 mt-1">Lab results · Discharge summary · Prior diagnosis</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {filename} — {charCount.toLocaleString()} characters extracted
          </div>
          <p className="text-xs text-gray-500 font-mono bg-white rounded p-2 border border-green-100 line-clamp-3">
            {preview}…
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

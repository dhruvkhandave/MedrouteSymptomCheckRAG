import Link from 'next/link'

export default function FooterDisclaimer() {
  return (
    <footer className="w-full">
      <div className="max-w-6xl mx-auto px-4 pb-5 pt-3">
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
          <p className="text-xs text-gray-600 text-center sm:text-left leading-relaxed">
            This tool does not diagnose, treat, or provide medical advice. It is informational only and not for emergencies. Call 911 or local emergency services for urgent symptoms. Always consult a licensed medical professional.
          </p>
          <Link href="/terms" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold whitespace-nowrap">
            Terms &amp; Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  )
}

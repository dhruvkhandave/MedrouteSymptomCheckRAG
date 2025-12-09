import Head from 'next/head'

export default function AppointmentAIAgent() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Head>
        <title>Appointment AI Agent | MedRoute</title>
      </Head>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-indigo-600 font-semibold">Coming Soon</p>
            <h1 className="text-3xl font-bold text-gray-900">Appointment AI Agent</h1>
            <p className="text-gray-600">
              A dedicated space for the upcoming voice-powered assistant that will help schedule appointments.
              The agent will handle availability, confirmations, and reminders once it&apos;s live.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
            We&apos;re preparing the voice workflow and integrations. Check back soon to start booking appointments
            with the AI assistant.
          </div>
        </div>
      </div>
    </main>
  )
}

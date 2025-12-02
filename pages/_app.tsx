import '@/styles/globals.css'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Session } from '@supabase/supabase-js'
import type { AppProps } from 'next/app'
import { useState } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase'
import FooterDisclaimer from '@/components/FooterDisclaimer'
import Navbar from '@/components/Navbar'

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session | null }>) {
  const [supabaseClient] = useState(() => createSupabaseBrowserClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Navbar />
      <Component {...pageProps} />
      <FooterDisclaimer />
    </SessionContextProvider>
  )
}

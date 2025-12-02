import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from './types'

// Browser Supabase client using new Pages Router helper
export const createSupabaseBrowserClient = () => createPagesBrowserClient<Database>()

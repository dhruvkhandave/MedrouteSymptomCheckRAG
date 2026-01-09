import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '@/lib/types'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createPagesServerClient<Database>({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!ADMIN_EMAIL) return res.status(500).json({ error: 'Admin email not configured' })
  const isAdmin = user?.email === ADMIN_EMAIL
  if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' })

  const { raw_text, condition, overrides } = req.body || {}
  if (!condition || !overrides) {
    return res.status(400).json({ error: 'raw_text, condition, and overrides are required' })
  }

  const { error } = await supabase.from('global_ai_rules').insert({
    raw_text: raw_text || null,
    condition,
    overrides,
  })

  if (error) {
    console.error('admin rules/create error', error)
    return res.status(500).json({ error: 'Failed to save rule' })
  }

  return res.status(200).json({ success: true })
}

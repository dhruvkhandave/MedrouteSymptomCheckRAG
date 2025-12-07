import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '@/lib/types'

const ADMIN_EMAIL = 'dkdave12345678@gmail.com'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createPagesServerClient<Database>({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id is required' })

  const { error } = await supabase.from('global_ai_rules').delete().eq('id', id)
  if (error) {
    console.error('admin rules/delete error', error)
    return res.status(500).json({ error: 'Failed to delete rule' })
  }

  return res.status(200).json({ success: true })
}

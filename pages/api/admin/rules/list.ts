import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '@/lib/types'

const ADMIN_EMAIL = 'dkdave12345678@gmail.com'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = createPagesServerClient<Database>({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email !== ADMIN_EMAIL) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabase
    .from('global_ai_rules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('admin rules/list error', error)
    return res.status(500).json({ error: 'Failed to fetch rules' })
  }

  return res.status(200).json(data || [])
}

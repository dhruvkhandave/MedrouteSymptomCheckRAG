import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import type { AnalyzeResponse, HistoryRow } from '@/lib/types'

type HistoryListResponse = {
  queries: HistoryRow[]
}

type HistoryDetailResponse = {
  query: HistoryRow | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryListResponse | HistoryDetailResponse | { error: string }>
) {
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = createPagesServerClient({ req, res })
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const userId = user.id
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
  const bodyId = req.body?.id

  const mapRow = (row: any): HistoryRow => ({
    id: row.id,
    created_at: row.created_at,
    user_id: row.user_id,
    input_text: row.input_text || '',
    structured_output: (row.structured_output || null) as AnalyzeResponse | null,
  })

  if (req.method === 'DELETE') {
    const deleteId = bodyId || idParam
    if (!deleteId) {
      return res.status(400).json({ error: 'id is required' })
    }
    const { error } = await supabase.from('health_queries').delete().eq('id', deleteId).eq('user_id', userId)
    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ query: null })
  }

  if (idParam) {
    const { data, error } = await supabase
      .from('health_queries')
      .select('id, input_text, structured_output, created_at, user_id')
      .eq('id', idParam)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: error?.message || 'Not found' })
    }

    return res.status(200).json({ query: mapRow(data) })
  }

  const { data, error } = await supabase
    .from('health_queries')
    .select('id, input_text, structured_output, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const rows = (data || []).map(mapRow)
  return res.status(200).json({ queries: rows })
}

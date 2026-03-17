import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { getEmbedding } from '@/lib/embeddings'
import type { Database } from '@/lib/types'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

function normalizeSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 128) return null
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null
  return trimmed
}

function chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const chunk = text.slice(start, start + chunkSize).trim()
    if (chunk.length > 50) chunks.push(chunk)
    start += chunkSize - overlap
  }
  return chunks
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { base64, filename, session_id } = req.body || {}
  const normalizedSessionId = normalizeSessionId(session_id)

  const supabaseAuth = createPagesServerClient<Database>({ req, res })
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser()

  if (userError || !user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (!base64 || !normalizedSessionId) {
    return res.status(400).json({ error: 'base64 and session_id are required' })
  }
  if (typeof base64 !== 'string' || base64.length < 20) {
    return res.status(400).json({ error: 'Invalid file payload' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const scopedSessionId = `${user.id}:${normalizedSessionId}`

  try {
    const buffer = Buffer.from(base64, 'base64')
    const uint8Array = new Uint8Array(buffer)
    const { extractText } = await import('unpdf')
    const { text, totalPages } = await extractText(uint8Array, { mergePages: true })

    const extractedText = typeof text === 'string' ? text : (text as string[]).join(' ')

    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({
        error: 'Could not extract text from this PDF. Make sure it is a text-based PDF, not a scanned image.',
      })
    }

    const { data: docRecord, error: docError } = await supabase
      .from('medical_documents')
      .insert({
        title: filename || 'Uploaded Document',
        source_type: 'pdf',
        session_id: scopedSessionId,
        status: 'processing',
        page_count: totalPages,
        char_count: extractedText.length,
      })
      .select('id')
      .single()

    if (docError || !docRecord) {
      console.error('Doc insert error:', docError)
      return res.status(500).json({ error: 'Failed to save document record' })
    }

    const docId = docRecord.id
    const chunks = chunkText(extractedText)
    const BATCH_SIZE = 8

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const embeddings = await Promise.all(batch.map((c) => getEmbedding(c)))

      const rows = batch.map((chunk_text, j) => ({
        document_id: docId,
        chunk_index: i + j,
        chunk_text,
        embedding: embeddings[j] as unknown as string,
        metadata: {},
      }))

      const { error: chunkError } = await supabase.from('medical_document_chunks').insert(rows)
      if (chunkError) {
        console.error('Chunk insert error:', chunkError)
      }
    }

    await supabase.from('medical_documents').update({ status: 'ready' }).eq('id', docId)

    return res.status(200).json({
      doc_id: docId,
      char_count: extractedText.length,
      chunk_count: chunks.length,
      preview: extractedText.slice(0, 300),
    })
  } catch (err) {
    console.error('Upload error:', err)
    return res.status(500).json({ error: 'Failed to process document' })
  }
}

import { MEDICAL_KNOWLEDGE, type MedicalItem } from '@/data/medical_knowledge'
import { getEmbedding } from './embeddings'

export type RetrievedSource = {
  id: string
  title: string
  summary: string
  guidance: string
  similarity: number
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  
  if (denominator === 0) {
    return 0
  }

  return dotProduct / denominator
}

/**
 * Build a searchable text string from a medical item
 */
function buildSearchText(item: MedicalItem): string {
  const parts = [
    item.title,
    item.summary,
    ...item.typical_symptoms,
    ...item.red_flags,
  ]
  return parts.join(' ').toLowerCase()
}

/**
 * Retrieve relevant medical knowledge sources based on user input
 * Uses embedding similarity to find the most relevant patterns
 */
export async function retrieveRelevantSources(
  userText: string,
  limit: number = 3
): Promise<RetrievedSource[]> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set - RAG retrieval disabled')
    return []
  }

  try {
    // Get embedding for user text
    const userEmbedding = await getEmbedding(userText.toLowerCase())

    // Compute similarity for each medical knowledge item
    const similarities = await Promise.all(
      MEDICAL_KNOWLEDGE.map(async (item) => {
        const searchText = buildSearchText(item)
        const itemEmbedding = await getEmbedding(searchText)
        const similarity = cosineSimilarity(userEmbedding, itemEmbedding)

        return {
          id: item.id,
          title: item.title,
          summary: item.summary,
          guidance: item.guidance,
          similarity,
        }
      })
    )

    // Sort by similarity (descending) and return top matches
    const sorted = similarities.sort((a, b) => b.similarity - a.similarity)
    
    // Filter out very low similarity scores (< 0.3) and return top results
    return sorted
      .filter((item) => item.similarity >= 0.3)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        guidance: item.guidance,
        similarity: Math.round(item.similarity * 100) / 100, // Round to 2 decimal places
      }))
  } catch (error) {
    console.error('Error in retrieveRelevantSources:', error)
    // Return empty array on error - don't break the main flow
    return []
  }
}


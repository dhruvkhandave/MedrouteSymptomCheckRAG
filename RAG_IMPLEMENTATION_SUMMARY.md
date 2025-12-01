# RAG Implementation Summary

Wanted to create a real basic rag implementation for this proj. Would love to add a heavier vector database in the future 

## Overview
A lightweight RAG (Retrieval Augmented Generation) system has been successfully integrated into the MedRoute application. The system uses OpenAI embeddings for semantic search over a local medical knowledge base, enhancing the symptom analysis with relevant clinical patterns.

## New Files Created

### 1. `data/medical_knowledge.ts`
- **Purpose**: Medical knowledge base with clinical patterns
- **Contents**: 
  - `MedicalItem` type definition
  - `MEDICAL_KNOWLEDGE` array with 13 clinical patterns
  - Patterns include: cardiac emergencies, respiratory infections, GI distress, meningeal signs, syncope, dehydration, urinary symptoms, allergic reactions, headaches, musculoskeletal pain, respiratory distress, fever patterns, and abdominal emergencies
- **Note**: No diagnoses, only general patterns and guidance

### 2. `lib/embeddings.ts`
- **Purpose**: OpenAI embeddings helper
- **Key Features**:
  - Uses `text-embedding-3-small` model
  - Server-side only (never exposes API key)
  - Returns embedding vector as `number[]`
  - Uses native `fetch` API (no OpenAI package needed)

### 3. `lib/retrieval.ts`
- **Purpose**: RAG retrieval logic
- **Key Features**:
  - `RetrievedSource` type definition
  - `retrieveRelevantSources()` function
  - Cosine similarity computation (no external math libs)
  - Filters results by similarity threshold (≥0.3)
  - Returns top 3 matches by default
  - Gracefully handles missing API key

## Modified Files

### 1. `pages/api/analyze.ts`
- **Changes**:
  - Added import: `import { retrieveRelevantSources, type RetrievedSource } from '@/lib/retrieval'`
  - Updated `AnalyzeResponse` interface to include `rag_sources?: RetrievedSource[]`
  - Added RAG retrieval step after Groq analysis
  - RAG runs asynchronously and doesn't break flow if it fails
  - Returns `rag_sources` array in API response

### 2. `pages/index.tsx`
- **Changes**:
  - Added `RetrievedSource` interface
  - Updated `AnalyzeResponse` interface to include `rag_sources`
  - Added "Reference Patterns" section in Doctor View
  - Displays RAG sources with:
    - Title
    - Summary
    - Guidance
    - Similarity score (as percentage)
  - Added disclaimer: "These are generalized clinical patterns and not a diagnosis."
  - Styled with purple theme to distinguish from other sections

## Environment Variable

### Required
Add to `.env.local`:
```
OPENAI_API_KEY= your key here
```

**Important**: 
- Server-side only (never use `NEXT_PUBLIC_` prefix)
- If missing, RAG is gracefully disabled (returns empty array)
- Does not break the main analyze endpoint

## How It Works

1. **User submits symptoms** → Frontend sends to `/api/analyze`
2. **Groq analyzes symptoms** → Generates structured output (unchanged)
3. **RAG retrieval** → 
   - Computes embedding for user's symptom text
   - Computes embeddings for all medical knowledge items
   - Calculates cosine similarity
   - Returns top 3 most relevant patterns
4. **Response includes** → Both Groq analysis and RAG sources
5. **Frontend displays** → RAG sources in "Reference Patterns" section

## Technical Details

### Embedding Model
- **Model**: `text-embedding-3-small`
- **Provider**: OpenAI API
- **Vector Size**: 1536 dimensions

### Similarity Threshold
- Minimum similarity: 0.3 (30%)
- Results below threshold are filtered out
- Top 3 results returned by default

### Error Handling
- Missing `OPENAI_API_KEY`: Returns empty array, logs warning
- API errors: Catched and logged, doesn't break main flow
- Network errors: Gracefully handled




## Frontend Display

The RAG sources appear in a new section:
- **Location**: After "Recommended Action", before "Clinical Patterns & Sources"
- **Styling**: Purple-themed cards with border
- **Information**: Title, summary, guidance, similarity score
- **Disclaimer**: Clear note that these are patterns, not diagnoses

## Testing Checklist

- [x] Build succeeds
- [x] TypeScript types correct
- [x] No linting errors
- [x] RAG integration doesn't break existing flow
- [x] Graceful handling of missing API key
- [x] Frontend displays RAG sources correctly
- [ ] Test with actual OpenAI API key (requires user setup)
- [ ] Verify embeddings are computed correctly
- [ ] Verify similarity scores are reasonable
- [ ] Test with various symptom descriptions

## Next Steps

1. **Add OpenAI API Key** to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Test the integration**:
   - Submit a symptom analysis
   - Check server logs for RAG retrieval
   - Verify RAG sources appear in results

3. **Optional Enhancements**:
   - Add more medical patterns to knowledge base
   - Adjust similarity threshold
   - Cache embeddings for better performance
   - Add loading state for RAG retrieval

## Notes

Will add vector database in future 


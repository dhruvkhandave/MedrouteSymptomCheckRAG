export interface StructuredOutput {
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  risk_factors: string[]
  medical_history?: string[]
  lifestyle?: string[]
  symptom_onset?: string
  followup_questions?: string[]
  followup_answers?: Record<string, string>
  sleep_hours?: string
  hydration_level?: string
  stress_level?: string
  recent_travel?: string
  exercise_level?: string
  diet_changes?: string
  recent_illness_exposure?: string
  alcohol_use?: string
  drug_use?: string
  sexual_activity?: string
  menstrual_cycle?: string
  chronic_conditions?: string[]
  current_medications?: string[]
}

export interface SourceMatch {
  condition: string
  matchedSymptoms: string[]
  score: number
  sources: Array<{ name: string; url: string }>
}

export interface NextSteps {
  immediate: string[]
  shortTerm: string[]
  seekCare: string[]
}

export interface RetrievedSource {
  id: string
  title: string
  summary: string
  guidance: string
  similarity: number
}

export interface AnalyzeResponse {
  structured_output: StructuredOutput
  final_score: number
  urgency: 'low' | 'medium' | 'high'
  recommended_action: string
  debug?: string[]
  sources?: SourceMatch[]
  rag_sources?: RetrievedSource[]
  next_steps?: NextSteps
}

export interface HistoryRow {
  id: string
  created_at: string
  user_id?: string
  input_text: string
  structured_output: AnalyzeResponse | null
}

// Minimal Supabase types used for typed clients
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      health_queries: {
        Row: {
          id: string
          user_id: string | null
          input_text: string | null
          structured_output: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          input_text?: string | null
          structured_output?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          input_text?: string | null
          structured_output?: Json | null
          created_at?: string
        }
      }
    }
  }
}

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { AnalyzeResponse, Database, StructuredOutput } from './types'

export type RuleCondition = {
  includes?: string[] | string
  severity_below?: 'mild' | 'moderate' | 'severe' | 'extremely severe'
  no_fever?: boolean
}

export type RuleOverrides = {
  interpret_as?: string
  severity_adjust?: 'mild' | 'moderate' | 'severe' | 'extremely severe'
  recommended_action?: string
  suppress_rag?: string[]
  suppress_labels?: string[]
  fallback_label?: string
}

export type RuleRow = {
  id: string
  user_id?: string
  raw_text: string | null
  condition: RuleCondition
  overrides: RuleOverrides
}

const severityRank: Record<string, number> = { mild: 0, moderate: 1, severe: 2, 'extremely severe': 3 }

const matchesRule = (
  condition: RuleCondition,
  analysisInput: { text: string; structured: StructuredOutput },
  modelOutput: AnalyzeResponse
): boolean => {
  const text = (analysisInput.text || '').toLowerCase()
  const symptoms = analysisInput.structured?.symptoms || []
  const currentSeverity = modelOutput.structured_output?.severity || 'moderate'

  if (condition.includes) {
    const keywords = Array.isArray(condition.includes) ? condition.includes : [condition.includes]
    const found = keywords.some((kw) => {
      const k = kw.toLowerCase()
      return text.includes(k) || symptoms.some((s) => s.toLowerCase().includes(k))
    })
    if (!found) return false
  }

  if (condition.no_fever) {
    if (text.includes('fever') || symptoms.some((s) => s.toLowerCase().includes('fever'))) {
      return false
    }
  }

  if (condition.severity_below) {
    const current = severityRank[currentSeverity] ?? 1
    const threshold = severityRank[condition.severity_below] ?? 1
    if (current >= threshold) return false
  }

  return true
}

const applyOverrides = (modelOutput: AnalyzeResponse, overrides: RuleOverrides): AnalyzeResponse => {
  const updated: AnalyzeResponse = {
    ...modelOutput,
    structured_output: { ...modelOutput.structured_output },
  }

  if (overrides.interpret_as) {
    const sym = updated.structured_output.symptoms || []
    const normalized = overrides.interpret_as.trim()
    if (normalized && !sym.some((s) => s.toLowerCase() === normalized.toLowerCase())) {
      updated.structured_output.symptoms = [...sym, normalized]
    }
  }

  if (overrides.severity_adjust) {
    updated.structured_output.severity = overrides.severity_adjust
  }

  if (overrides.recommended_action) {
    updated.recommended_action = overrides.recommended_action
  }

  if (overrides.suppress_labels && overrides.suppress_labels.length > 0) {
    const currentLabel = (updated as any).label || (updated.structured_output as any).label || ''
    if (currentLabel && overrides.suppress_labels.includes(currentLabel)) {
      const fb = overrides.fallback_label || 'unspecified_symptom'
      ;(updated as any).label = fb
      ;(updated.structured_output as any).label = fb
    }
  }

  return updated
}

export async function applyRulesForUser(
  userId: string | null | undefined,
  analysisInput: { text: string; structured: StructuredOutput },
  modelOutput: AnalyzeResponse,
  supabaseClient?: ReturnType<typeof createPagesServerClient<Database>>
): Promise<AnalyzeResponse> {
  // Per-user rules table is not used; return unchanged
  return modelOutput
}

export async function applyGlobalRules(
  client: ReturnType<typeof createPagesServerClient<Database>>,
  analysisInput: { text: string; structured: StructuredOutput },
  modelOutput: AnalyzeResponse
): Promise<AnalyzeResponse> {
  try {
    const { data, error } = await client.from('global_ai_rules').select('*')
    if (error || !data) return modelOutput
    let updated = modelOutput
    const rules = data as RuleRow[]
    for (const rule of rules) {
      if (matchesRule(rule.condition || {}, analysisInput, updated)) {
        updated = applyOverrides(updated, rule.overrides || {})
      }
    }
    return updated
  } catch (e) {
    console.warn('applyGlobalRules error', e)
    return modelOutput
  }
}

export function applyRagSuppression(ragResults: any[], rules: RuleRow[]): any[] {
  if (!ragResults || !Array.isArray(ragResults) || ragResults.length === 0) return ragResults || []
  const suppressed = new Set<string>()
  rules.forEach((rule) => {
    const ids = rule.overrides?.suppress_rag
    if (Array.isArray(ids)) {
      ids.forEach((id) => {
        if (typeof id === 'string') suppressed.add(id)
      })
    }
  })
  if (suppressed.size === 0) return ragResults
  return ragResults.filter((r) => !suppressed.has(r.id))
}

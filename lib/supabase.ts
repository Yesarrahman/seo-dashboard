import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Types ────────────────────────────────────────────────────

export interface Project {
  id: string
  user_id: string
  name: string
  website_url: string
  status: string
  created_at: string
  updated_at: string
}

export interface Keyword {
  id: string
  project_id: string
  keyword: string
  location: string | null
  device: string
  created_at: string
}

export interface Competitor {
  id: string
  project_id: string
  url: string
  name: string | null
  created_at: string
}

export interface ProjectSettings {
  project_id: string
  monitoring_frequency: string
  alert_rank_drop_threshold: number
  alert_on_competitor_changes: boolean
  alert_on_new_content_gaps: boolean
}

export interface SerpChange {
  id: string
  project_id: string
  keyword_id: string
  url: string
  change_type: string
  position_before: number | null
  position_after: number | null
  position_change: number | null
  detected_at: string
}

export interface ContentGap {
  id: string
  project_id: string
  suggested_topic: string
  priority_score: number | null
  reasoning: string | null
  status: string
  created_at: string
}

export interface Report {
  id: string
  project_id: string
  report_type: string
  pdf_url: string | null
  generated_at: string
}

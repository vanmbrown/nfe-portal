// Focus Group TypeScript Types

export type AgeRange = '18-25' | '26-35' | '36-45' | '46-55' | '56+'

export type FitzpatrickSkinTone = 1 | 2 | 3 | 4 | 5 | 6

export type ImageType = 'before' | 'during' | 'after'

export type SkinConcern = 
  | 'dark_spots'
  | 'dryness_barrier'
  | 'fine_lines'
  | 'firmness'
  | 'sensitivity_redness'
  | 'texture_pores'
  | 'tone_glow'
  | 'uneven_skin_tone'

export type LifestyleFactor = 
  | 'active_outdoors'
  | 'indoor_work'
  | 'frequent_travel'
  | 'stress_management'
  | 'sleep_quality'
  | 'diet_focus'

export interface Profile {
  id: string
  user_id: string
  // Foundational fields
  age_range: AgeRange | null
  fitzpatrick_skin_tone: FitzpatrickSkinTone | null
  gender_identity: string | null
  ethnic_background: string | null
  skin_type: 'Dry' | 'Oily' | 'Combination' | 'Normal' | 'Sensitive' | null
  top_concerns: SkinConcern[] | null
  lifestyle: LifestyleFactor[] | null
  climate_exposure: string | null
  uv_exposure: string | null
  sleep_quality: string | null
  stress_level: string | null
  // Routine & ritual
  current_routine: string | null
  routine_frequency: string | null
  known_sensitivities: string | null
  product_use_history: string | null
  ideal_routine: string | null
  ideal_product: string | null
  routine_placement_insight: string | null
  // Financial commitment
  avg_spend_per_item: number | null
  annual_skincare_spend: number | null
  max_spend_motivation: string | null
  value_stickiness: string | null
  pricing_threshold_proof: string | null
  category_premium_insight: string | null
  // Problem validation
  unmet_need: string | null
  money_spent_trying: string | null
  performance_expectation: string | null
  drop_off_reason: string | null
  // Language & identity
  elixir_association: string | null
  elixir_ideal_user: string | null
  favorite_brand: string | null
  favorite_brand_reason: string | null
  // Pain point & ingredient
  specific_pain_point: string | null
  ingredient_awareness: string | null
  // Influence & advocacy
  research_effort_score: number | null
  influence_count: number | null
  brand_switch_influence: boolean | null
  // Consent
  image_consent: boolean
  marketing_consent: boolean
  data_use_consent: boolean | null
  // Cohort metadata (admin)
  cohort_name: string | null
  participation_status: string | null
  uploads_count: number | null
  last_submission: string | null
  has_follow_up_survey: boolean | null
  // Timestamps
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  user_id: string
  week_number: number
  hydration_rating: number // 1-5
  tone_rating: number // 1-5
  texture_rating: number // 1-5
  overall_rating: number // 1-5
  notes: string | null
  created_at: string
}

export interface Image {
  id: string
  user_id: string
  type: ImageType
  filename: string
  url: string
  mime_type: string
  size: number
  image_consent: boolean
  marketing_consent: boolean
  created_at: string
}

export interface UserRole {
  isAdmin: boolean
  isParticipant: boolean
}

export interface FocusGroupFeedback {
  id: string
  profile_id: string
  week_number: number
  feedback_date: string
  product_usage: string | null
  perceived_changes: string | null
  concerns_or_issues: string | null
  emotional_response: string | null
  overall_rating: number | null // 1-10
  next_week_focus: string | null
  created_at: string
}

export interface FocusGroupUpload {
  id: string
  profile_id: string
  upload_date: string
  week_number: number
  image_url: string
  notes: string | null
  consent_given: boolean
  verified_by_admin: boolean
  created_at: string
}


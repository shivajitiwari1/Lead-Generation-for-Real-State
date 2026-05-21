export type LeadType = "it_service" | "property"
export type LeadScore = "high" | "medium" | "low"
export type LeadStatus = "new" | "contacted" | "interested" | "closed" | "not_interested"
export type LeadSource = "google_maps" | "linkedin" | "justdial" | "indiamart" | "instagram" | "manual"

export interface Lead {
  id: string
  type: LeadType
  full_name: string
  company_name: string
  designation: string
  email: string
  phone: string
  linkedin: string
  website: string
  location: string
  lead_source: LeadSource
  score: LeadScore
  score_reason: string
  status: LeadStatus
  notes: string
  outreach_count: number
  last_contacted: string | null
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error: string | null
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface User {
  id: string
  username: string
}

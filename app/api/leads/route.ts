/* eslint-disable */
import { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { readJson, appendItem } from "@/lib/server/json-service"
import { isDuplicate } from "@/lib/server/dedup"
import { getCurrentUser, ok, err } from "@/lib/server/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const type = searchParams.get("type")
  const score = searchParams.get("score")
  const status = searchParams.get("status")
  const location = searchParams.get("location")
  const lead_source = searchParams.get("lead_source")

  let leads = await readJson("leads")

  if (type) leads = leads.filter((l: any) => l.type === type)
  if (score) leads = leads.filter((l: any) => l.score === score)
  if (status) leads = leads.filter((l: any) => l.status === status)
  if (location)
    leads = leads.filter((l: any) =>
      (l.location ?? "").toLowerCase().includes(location.toLowerCase())
    )
  if (lead_source) leads = leads.filter((l: any) => l.lead_source === lead_source)

  const total = leads.length
  const start = (page - 1) * limit
  const data = leads.slice(start, start + limit)

  return ok(data, 200, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const body = await request.json()

  if (body.email || body.phone) {
    if (await isDuplicate(body.email ?? "", body.phone ?? "")) {
      return err("Lead with same email/phone already exists", 409)
    }
  }

  const now = new Date().toISOString()
  const lead = {
    id: uuidv4(),
    type: body.type ?? "it_service",
    full_name: body.full_name ?? "",
    company_name: body.company_name ?? "",
    designation: body.designation ?? "",
    email: body.email ?? "",
    phone: body.phone ?? "",
    linkedin: body.linkedin ?? "",
    website: body.website ?? "",
    location: body.location ?? "",
    lead_source: body.lead_source ?? "manual",
    score: "medium",
    score_reason: "",
    status: "new",
    notes: body.notes ?? "",
    outreach_count: 0,
    last_contacted: null,
    created_at: now,
    updated_at: now,
  }

  await appendItem("leads", lead)
  return ok(lead)
}

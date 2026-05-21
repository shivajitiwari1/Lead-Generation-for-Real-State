/* eslint-disable */
import { NextRequest } from "next/server"
import { findById, updateItem, deleteItem } from "@/lib/server/json-service"
import { getCurrentUser, ok, err } from "@/lib/server/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const lead = await findById("leads", params.id)
  if (!lead) return err("Lead not found", 404)
  return ok(lead)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const body = await request.json()
  const updates: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(body)) {
    if (v !== null && v !== undefined) updates[k] = v
  }
  updates.updated_at = new Date().toISOString()

  const updated = await updateItem("leads", params.id, updates)
  if (!updated) return err("Lead not found", 404)
  return ok(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const deleted = await deleteItem("leads", params.id)
  if (!deleted) return err("Lead not found", 404)
  return ok({ deleted: true })
}

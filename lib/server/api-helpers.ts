import { NextResponse } from "next/server"
import { decodeToken } from "./auth-utils"

export function ok<T>(
  data: T,
  status = 200,
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
): NextResponse {
  return NextResponse.json(
    { success: true, data, error: null, pagination: pagination ?? null },
    { status }
  )
}

export function err(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, data: null, error: message },
    { status }
  )
}

export async function getCurrentUser(
  request: Request
): Promise<Record<string, unknown> | null> {
  const cookie = request.headers.get("cookie") ?? ""
  const match = cookie.match(/access_token=([^;]+)/)
  if (!match) return null
  return decodeToken(decodeURIComponent(match[1]))
}

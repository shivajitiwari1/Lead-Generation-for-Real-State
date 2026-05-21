/* eslint-disable */
import { NextRequest, NextResponse } from "next/server"
import { readJson } from "@/lib/server/json-service"
import { getCurrentUser, err } from "@/lib/server/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)

  const format = new URL(request.url).searchParams.get("format") ?? "json"
  const leads = await readJson("leads")

  if (format === "csv") {
    if (leads.length === 0) {
      return new NextResponse("id,full_name,email,phone,type,score,status\r\n", {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=leads.csv",
        },
      })
    }
    const headers = Object.keys(leads[0]).join(",")
    const rows = (leads as any[]).map((l) =>
      Object.values(l)
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    const csv = [headers, ...rows].join("\r\n")
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=leads.csv",
      },
    })
  }

  return new NextResponse(JSON.stringify(leads, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=leads.json",
    },
  })
}

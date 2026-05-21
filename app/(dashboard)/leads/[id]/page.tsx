/* eslint-disable */
"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/Header"
import { ScoreTag } from "@/components/leads/ScoreTag"
import { api } from "@/lib/api"
import type { Lead } from "@/lib/types"

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.leads.get(id)
      .then((res: any) => {
        setLead(res.data)
        setNotes(res.data.notes ?? "")
        setStatus(res.data.status)
      })
      .catch(() => router.push("/leads"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    if (!lead) return
    setSaving(true)
    try {
      const res = await api.leads.update(id, { notes, status: status as Lead["status"] }) as any
      setLead(res.data)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading…</div>
  if (!lead) return null

  const fields: [string, string][] = [
    ["Full Name", lead.full_name],
    ["Company", lead.company_name],
    ["Designation", lead.designation],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Location", lead.location],
    ["Source", lead.lead_source.replace("_", " ")],
    ["Website", lead.website],
    ["LinkedIn", lead.linkedin],
    ["Created", new Date(lead.created_at).toLocaleDateString()],
  ]

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Lead Detail" />
      <main className="flex-1 p-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{lead.full_name}</h2>
          <ScoreTag score={lead.score} />
          {lead.score_reason && (
            <span className="text-xs text-muted-foreground">{lead.score_reason}</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {fields.map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium truncate max-w-48">{value || "—"}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">CRM Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {["new","contacted","interested","closed","not_interested"].map(s => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={5}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Add notes about this lead…"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Outreach History</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Outreach count: {lead.outreach_count} / 2 •{" "}
              {lead.last_contacted
                ? `Last contacted: ${new Date(lead.last_contacted).toLocaleDateString()}`
                : "Not yet contacted"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Full outreach history available after Plan 2 (AI + Outreach) is implemented.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

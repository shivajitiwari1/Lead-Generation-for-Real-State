/* eslint-disable */
"use client"
import { useEffect, useState } from "react"
import { Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/Header"
import { LeadTable } from "@/components/leads/LeadTable"
import { LeadForm } from "@/components/leads/LeadForm"
import { api } from "@/lib/api"
import type { Lead } from "@/lib/types"

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [scoreFilter, setScoreFilter] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  async function fetchLeads() {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 20 }
      if (typeFilter) params.type = typeFilter
      if (scoreFilter) params.score = scoreFilter
      const res = await api.leads.list(params) as any
      setLeads(res.data ?? [])
      setTotal(res.pagination?.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [page, typeFilter, scoreFilter])

  const filtered = search
    ? leads.filter(l =>
        l.full_name.toLowerCase().includes(search.toLowerCase()) ||
        l.company_name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())
      )
    : leads

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return
    await api.leads.delete(id)
    setLeads(ls => ls.filter(l => l.id !== id))
    setTotal(t => t - 1)
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Leads" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search name, company, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="it_service">IT Service</option>
            <option value="property">Property</option>
          </select>
          <select
            value={scoreFilter}
            onChange={e => { setScoreFilter(e.target.value); setPage(1) }}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Scores</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="ml-auto flex gap-2">
            <a href={api.leads.exportUrl("csv")} download>
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" /> Export CSV
              </Button>
            </a>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Lead
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">{total} total leads</div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <LeadTable leads={filtered} onDelete={handleDelete} />
        )}

        {total > 20 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </main>
      <LeadForm open={showForm} onClose={() => setShowForm(false)} onCreated={lead => { setLeads(ls => [lead, ...ls]); setTotal(t => t + 1) }} />
    </div>
  )
}

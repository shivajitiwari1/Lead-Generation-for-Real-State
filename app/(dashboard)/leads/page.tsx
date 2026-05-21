/* eslint-disable */
"use client"
import { useEffect, useState } from "react"
import { Download, Plus, Zap, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/Header"
import { LeadForm } from "@/components/leads/LeadForm"
import { api } from "@/lib/api"
import type { Lead } from "@/lib/types"

// ── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "IT Company", "Software Company", "Startup", "Digital Agency",
  "Clinic", "Hospital", "Dental Clinic", "Pharmacy",
  "School", "Coaching Institute", "CA Firm", "Factory",
  "Wholesaler", "Distributor", "Restaurant", "Hotel", "Real Estate Agency",
]

const INDIA_STATES = [
  "Delhi", "Mumbai", "Noida", "Gurgaon", "Bangalore", "Hyderabad",
  "Chennai", "Kolkata", "Pune", "Ahmedabad", "Surat", "Jaipur",
  "Lucknow", "Chandigarh", "Indore", "Bhopal",
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
]

const SOURCES = [
  "Google Maps", "IndiaMART", "JustDial", "TradeIndia",
  "LinkedIn", "Facebook", "Instagram", "Twitter / X", "YouTube",
]

const SCORE_COLORS: Record<string, string> = {
  high: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

const STATUS_OPTIONS = ["new", "contacted", "interested", "closed", "not_interested"]

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [searchOpen, setSearchOpen] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchMsg, setSearchMsg] = useState("")

  // Search panel state
  const [selBizTypes, setSelBizTypes] = useState<string[]>([])
  const [customType, setCustomType] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [selStates, setSelStates] = useState<string[]>([])
  const [cityOverride, setCityOverride] = useState("")
  const [selSources, setSelSources] = useState<string[]>([])

  // Filter state
  const [scoreFilter, setScoreFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sourceFilter, setSourceFilter] = useState("")
  const [emailPhoneOnly, setEmailPhoneOnly] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  async function fetchLeads() {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 25 }
      if (scoreFilter) params.score = scoreFilter
      if (statusFilter) params.status = statusFilter
      if (sourceFilter) params.lead_source = sourceFilter
      const res = await api.leads.list(params) as any
      let data: Lead[] = res.data ?? []
      if (emailPhoneOnly) data = data.filter(l => l.email || l.phone)
      setLeads(data)
      setTotal(res.pagination?.total ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeads() }, [page, scoreFilter, statusFilter, sourceFilter, emailPhoneOnly])

  function toggleItem(arr: string[], setArr: (v: string[]) => void, item: string) {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  function selectAll(items: string[], setArr: (v: string[]) => void) {
    setArr(items)
  }

  function selectNone(setArr: (v: string[]) => void) {
    setArr([])
  }

  const combinations = Math.max(1, selBizTypes.length) *
    Math.max(1, selStates.length) *
    Math.max(1, selSources.length)

  async function runSearch(mode: "first" | "all_sources" | "combinations" | "auto") {
    const bizTypes  = selBizTypes.length  ? selBizTypes  : [BUSINESS_TYPES[0]]
    const locations = selStates.length    ? selStates    : ["Delhi"]
    const sources   = selSources.length   ? selSources   : [SOURCES[0]]
    const body = { bizTypes, locations, sources, mode }
    setSearching(true)
    setSearchMsg("Searching leads…")
    try {
      const res = await fetch("/api/leads/search", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setSearchMsg(`✅ ${data.data.message}`)
        setSearchOpen(false)
        fetchLeads()
      } else {
        setSearchMsg(`❌ ${data.error}`)
      }
    } catch (e) {
      setSearchMsg("❌ Search failed")
    } finally {
      setSearching(false)
      setTimeout(() => setSearchMsg(""), 4000)
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await api.leads.update(id, { status: status as any })
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status: status as any } : l))
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return
    await api.leads.delete(id)
    setLeads(ls => ls.filter(l => l.id !== id))
    setTotal(t => t - 1)
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-[#0d0d0d] text-white">
      <Header title="" />

      <main className="flex-1 p-4 space-y-4">
        {/* Page title + controls */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Leads <span className="text-gray-400 font-normal text-base">({total})</span>
          </h1>
          <div className="flex gap-2">
            <a href={api.leads.exportUrl("csv")} download>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
              </Button>
            </a>
            <Button variant="outline" size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setSearchOpen(o => !o)}>
              {searchOpen ? <><X className="mr-1 h-3.5 w-3.5" /> Close Search</> : <><Search className="mr-1 h-3.5 w-3.5" /> Find Leads</>}
            </Button>
          </div>
        </div>

        {/* ── FIND NEW LEADS panel ── */}
        {searchOpen && (
          <div className="rounded-xl border border-gray-800 bg-[#141414] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Find New Leads</p>
              <p className="text-xs text-purple-400">
                {selBizTypes.length || 1} types × {selStates.length || 1} locations × {selSources.length || 1} sources = <strong>{combinations} combinations</strong>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Business Type */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-300">Business Type <span className="text-purple-400">({selBizTypes.length} selected)</span></p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <button onClick={() => selectAll(BUSINESS_TYPES, setSelBizTypes)} className="hover:text-white">All</button>
                    <button onClick={() => selectNone(setSelBizTypes)} className="hover:text-white">None</button>
                  </div>
                </div>
                <div className="h-44 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {BUSINESS_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={selBizTypes.includes(t)}
                        onChange={() => toggleItem(selBizTypes, setSelBizTypes, t)}
                        className="accent-purple-500 w-3.5 h-3.5" />
                      {t}
                    </label>
                  ))}
                  {showCustomInput ? (
                    <div className="flex gap-1 mt-1">
                      <input value={customType} onChange={e => setCustomType(e.target.value)}
                        placeholder="Custom type…"
                        className="flex-1 rounded bg-gray-800 border border-gray-700 px-2 py-0.5 text-xs text-white"
                        onKeyDown={e => {
                          if (e.key === "Enter" && customType.trim()) {
                            setSelBizTypes(p => [...p, customType.trim()])
                            setCustomType("")
                            setShowCustomInput(false)
                          }
                        }} />
                    </div>
                  ) : (
                    <button onClick={() => setShowCustomInput(true)}
                      className="text-xs text-purple-400 hover:text-purple-300 mt-1">
                      + Add custom type
                    </button>
                  )}
                </div>
              </div>

              {/* India States */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-300">Location — India <span className="text-purple-400">({selStates.length} selected)</span></p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <button onClick={() => selectAll(INDIA_STATES, setSelStates)} className="hover:text-white">All</button>
                    <button onClick={() => selectNone(setSelStates)} className="hover:text-white">None</button>
                  </div>
                </div>
                <input value={cityOverride} onChange={e => setCityOverride(e.target.value)}
                  placeholder="Type city to override (e.g. Noida)"
                  className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-1 text-xs text-white mb-2 placeholder-gray-600" />
                <div className="h-36 overflow-y-auto space-y-1 pr-1">
                  {INDIA_STATES.map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={selStates.includes(s)}
                        onChange={() => toggleItem(selStates, setSelStates, s)}
                        className="accent-purple-500 w-3.5 h-3.5" />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sources */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-gray-300">Sources <span className="text-purple-400">({selSources.length} selected)</span></p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <button onClick={() => selectAll(SOURCES, setSelSources)} className="hover:text-white">All</button>
                    <button onClick={() => selectNone(setSelSources)} className="hover:text-white">None</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {SOURCES.map(s => (
                    <label key={s} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                      <input type="checkbox" checked={selSources.includes(s)}
                        onChange={() => toggleItem(selSources, setSelSources, s)}
                        className="accent-purple-500 w-3.5 h-3.5" />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button size="sm" variant="outline" disabled={searching}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => runSearch("first")}>
                {searching ? "Searching…" : "Search 1st selected"}
              </Button>
              <Button size="sm" disabled={searching}
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => runSearch("all_sources")}>
                {searching ? "Searching…" : `Search ALL ${SOURCES.length} Sources`}
              </Button>
              <Button size="sm" disabled={searching}
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => runSearch("combinations")}>
                🔀 Search All Combinations ({Math.max(1, selBizTypes.length)}×{Math.max(1, selStates.length)}×{Math.max(1, selSources.length)})
              </Button>
              <Button size="sm" disabled={searching}
                className="bg-green-600 hover:bg-green-700"
                onClick={() => runSearch("auto")}>
                <Zap className="mr-1 h-3.5 w-3.5" /> {searching ? "Working…" : "Auto Search + Analyze + Score"}
              </Button>
              {searchMsg && (
                <span className={`text-xs px-3 py-1 rounded-full ${searchMsg.startsWith("✅") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {searchMsg}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-800 bg-[#141414] px-4 py-2">
          <span className="text-xs text-gray-500 font-medium">FILTER:</span>

          <select value={scoreFilter} onChange={e => { setScoreFilter(e.target.value); setPage(1) }}
            className="rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-1.5 text-xs text-gray-300">
            <option value="">All Scores</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-1.5 text-xs text-gray-300">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>

          <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1) }}
            className="rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-1.5 text-xs text-gray-300">
            <option value="">All Sources</option>
            <option value="google_maps">Google Maps</option>
            <option value="indiamart">IndiaMART</option>
            <option value="justdial">JustDial</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="manual">Manual</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>From</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="rounded border border-gray-700 bg-[#1a1a1a] px-2 py-1 text-xs text-gray-300" />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>To</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="rounded border border-gray-700 bg-[#1a1a1a] px-2 py-1 text-xs text-gray-300" />
          </div>

          <button
            onClick={() => { setEmailPhoneOnly(p => !p); setPage(1) }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              emailPhoneOnly
                ? "bg-green-500/20 border-green-500/40 text-green-400"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            <span className={`w-2 h-2 rounded-full ${emailPhoneOnly ? "bg-green-400" : "bg-gray-600"}`} />
            With email / phone only
          </button>

          <span className="ml-auto text-xs text-gray-400">{total} leads</span>
        </div>

        {/* ── Table ── */}
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#141414]">
                {["BUSINESS", "EMAIL", "PHONE", "LOCATION", "SOURCE", "SCORE", "STATUS", "ACTIONS"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h} {["BUSINESS","EMAIL","PHONE","LOCATION","SOURCE","SCORE","STATUS"].includes(h) && <span className="text-gray-600">↕</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-gray-800 animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    No leads yet. Use the search panel above or add manually.
                  </td>
                </tr>
              ) : leads.map((lead, i) => (
                <tr key={lead.id}
                  className={`border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111111]"}`}>

                  {/* Business */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <a href={`/leads/${lead.id}`} className="font-medium text-white hover:text-purple-400 transition-colors line-clamp-1">
                      {lead.company_name || lead.full_name || "—"}
                    </a>
                    {lead.website && (
                      <p className="text-xs text-gray-500 truncate">{lead.website}</p>
                    )}
                    <p className="text-xs text-gray-600">{new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {lead.email || <span className="text-gray-700">—</span>}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-gray-300 text-xs font-mono">
                    {lead.phone || <span className="text-gray-700">—</span>}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {lead.location || <span className="text-gray-700">—</span>}
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 text-gray-400 text-xs capitalize">
                    {lead.lead_source.replace("_", " ")}
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize ${SCORE_COLORS[lead.score] ?? SCORE_COLORS.low}`}>
                      {lead.score}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={e => handleStatusChange(lead.id, e.target.value)}
                      className="rounded border border-gray-700 bg-[#1a1a1a] px-2 py-1 text-xs text-gray-300 capitalize cursor-pointer">
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a href={`/leads/${lead.id}`}>
                        <Button size="sm" className="h-7 px-3 text-xs bg-purple-600 hover:bg-purple-700">
                          Proposal
                        </Button>
                      </a>
                      <Button size="sm" variant="ghost"
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(lead.id)}>
                        ✕
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 25 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            <Button variant="outline" size="sm" disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Previous
            </Button>
            <span className="text-xs text-gray-400">Page {page} of {Math.ceil(total / 25)}</span>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 25)}
              onClick={() => setPage(p => p + 1)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Next
            </Button>
          </div>
        )}
      </main>

      <LeadForm open={showForm} onClose={() => setShowForm(false)}
        onCreated={lead => { setLeads(ls => [lead, ...ls]); setTotal(t => t + 1) }} />
    </div>
  )
}

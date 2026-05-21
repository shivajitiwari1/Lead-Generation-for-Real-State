/* eslint-disable */
"use client"
import { useEffect, useState } from "react"
import { Users, TrendingUp, Mail, Bell } from "lucide-react"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import type { Lead } from "@/lib/types"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

function StatsCard({ title, value, icon: Icon, accent = "default" }: {
  title: string
  value: string | number
  icon: LucideIcon
  accent?: "green" | "yellow" | "blue" | "default"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-4 w-4",
          accent === "green" && "text-green-500",
          accent === "yellow" && "text-yellow-500",
          accent === "blue" && "text-blue-500",
          accent === "default" && "text-muted-foreground",
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          accent === "green" && "text-green-500",
          accent === "yellow" && "text-yellow-500",
          accent === "blue" && "text-blue-500",
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.leads.list({ limit: 100 })
      .then((res: any) => setLeads(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = leads.length
  const highValue = leads.filter(l => l.score === "high").length
  const interested = leads.filter(l => l.status === "interested").length
  const followupsPending = leads.filter(l => {
    if (l.outreach_count >= 2 || !l.last_contacted) return false
    const days = (Date.now() - new Date(l.last_contacted).getTime()) / 86400000
    return days > 5
  }).length

  const recent = [...leads].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8)

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatsCard title="Total Leads" value={total} icon={Users} />
            <StatsCard title="High Value" value={highValue} icon={TrendingUp} accent="green" />
            <StatsCard title="Interested" value={interested} icon={Mail} accent="blue" />
            <StatsCard title="Follow-ups Due" value={followupsPending} icon={Bell} accent="yellow" />
          </div>
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Leads</h2>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Company</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Score</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead, i) => (
                  <tr key={lead.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="px-4 py-2 font-medium">{lead.full_name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{lead.company_name || "—"}</td>
                    <td className="px-4 py-2 capitalize">{lead.type.replace("_", " ")}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        lead.score === "high" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        lead.score === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}>{lead.score}</span>
                    </td>
                    <td className="px-4 py-2 capitalize text-muted-foreground">{lead.status.replace("_", " ")}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No leads yet. Add your first lead from the Leads page.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

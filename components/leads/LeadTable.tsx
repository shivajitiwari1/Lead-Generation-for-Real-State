"use client"
import Link from "next/link"
import { Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScoreTag } from "./ScoreTag"
import type { Lead } from "@/lib/types"

interface LeadTableProps {
  leads: Lead[]
  onDelete: (id: string) => void
}

export function LeadTable({ leads, onDelete }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-lg border py-16 text-center text-muted-foreground">
        No leads found. Add one with the button above.
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Company</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Score</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Location</th>
            <th className="px-4 py-3 text-left font-medium">Source</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => (
            <tr key={lead.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
              <td className="px-4 py-3 font-medium">
                <Link href={`/leads/${lead.id}`} className="hover:underline text-primary">
                  {lead.full_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{lead.company_name || "—"}</td>
              <td className="px-4 py-3 capitalize">{lead.type.replace("_", " ")}</td>
              <td className="px-4 py-3"><ScoreTag score={lead.score} /></td>
              <td className="px-4 py-3 capitalize text-muted-foreground">{lead.status.replace("_", " ")}</td>
              <td className="px-4 py-3 text-muted-foreground">{lead.location || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground capitalize">{lead.lead_source.replace("_", " ")}</td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Link href={`/leads/${lead.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(lead.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

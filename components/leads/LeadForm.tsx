/* eslint-disable */
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import type { Lead } from "@/lib/types"

interface LeadFormProps {
  open: boolean
  onClose: () => void
  onCreated: (lead: Lead) => void
}

export function LeadForm({ open, onClose, onCreated }: LeadFormProps) {
  const [form, setForm] = useState({
    type: "it_service" as "it_service" | "property",
    full_name: "",
    company_name: "",
    designation: "",
    email: "",
    phone: "",
    linkedin: "",
    website: "",
    location: "",
    lead_source: "manual" as const,
    notes: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.leads.create(form) as any
      onCreated(res.data)
      onClose()
      setForm({ type: "it_service", full_name: "", company_name: "", designation: "", email: "", phone: "", linkedin: "", website: "", location: "", lead_source: "manual", notes: "" })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create lead")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="it_service">IT Service</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Lead Source</Label>
              <Select value={form.lead_source} onValueChange={v => set("lead_source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["manual","google_maps","linkedin","justdial","indiamart","instagram"].map(s => (
                    <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {([
            ["full_name","Full Name", true],
            ["company_name","Company Name", false],
            ["designation","Designation", false],
            ["email","Email", false],
            ["phone","Phone", false],
            ["location","Location (City)", false],
            ["website","Website URL", false],
            ["linkedin","LinkedIn URL", false],
          ] as [string, string, boolean][]).map(([key, label, required]) => (
            <div key={key} className="space-y-1">
              <Label>{label}</Label>
              <Input
                value={(form as Record<string, string>)[key]}
                onChange={e => set(key, e.target.value)}
                required={required}
              />
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating…" : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { readJson } from "./json-service"

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length > 10 ? digits.slice(-10) : digits
}

export function makeFingerprint(email: string, phone: string): string {
  return `${normaliseEmail(email)}|${normalisePhone(phone)}`
}

export async function isDuplicate(
  email: string,
  phone: string
): Promise<boolean> {
  if (!email && !phone) return false
  const fp = makeFingerprint(email, phone)
  const leads = await readJson("leads")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const lead of leads as any[]) {
    const leadFp = makeFingerprint(lead.email ?? "", lead.phone ?? "")
    if (leadFp && leadFp === fp) return true
  }
  return false
}

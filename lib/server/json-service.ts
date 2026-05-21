/* eslint-disable */
import { promises as fs } from "fs"
import path from "path"

// Module-level memory cache — persists within the same Vercel container instance
// so all API routes on the same warm Lambda see the same data.
const memStore: Map<string, any[]> = new Map()

const DEFAULTS: Record<string, any> = {
  settings: { users: [], daily_email_count: 0, daily_email_date: "" },
}

// Seed from deployed data/*.json files on first access
async function seedFromDisk(collection: string): Promise<any[]> {
  try {
    const fp = path.join(process.cwd(), "data", `${collection}.json`)
    const text = await fs.readFile(fp, "utf-8")
    if (!text.trim()) return Array.isArray(DEFAULTS[collection]) ? [] : DEFAULTS[collection] ? [DEFAULTS[collection]] : []
    const parsed = JSON.parse(text)
    // settings.json is an object, not array — handle separately
    if (!Array.isArray(parsed)) return parsed
    return parsed
  } catch {
    return []
  }
}

async function getStore(collection: string): Promise<any> {
  if (!memStore.has(collection)) {
    const data = await seedFromDisk(collection)
    memStore.set(collection, data as any)
  }
  return memStore.get(collection)
}

function setStore(collection: string, data: any): void {
  memStore.set(collection, data)
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function readJson(collection: string): Promise<any[]> {
  const data = await getStore(collection)
  // settings is an object — return as-is via writeJson/readJson callers that cast
  return Array.isArray(data) ? data : data
}

export async function writeJson(collection: string, data: unknown): Promise<void> {
  setStore(collection, data)
  // Also persist to /tmp so data survives within the same container restart
  try {
    const dir = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data")
    await fs.mkdir(dir, { recursive: true })
    const fp = path.join(dir, `${collection}.json`)
    const tmp = fp + ".tmp"
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8")
    await fs.rename(tmp, fp)
  } catch { /* ignore write errors on read-only FS */ }
}

export async function appendItem(
  collection: string,
  item: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const items = await readJson(collection) as any[]
  items.push(item)
  await writeJson(collection, items)
  return item
}

export async function findById(
  collection: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const items = await readJson(collection) as any[]
  return items.find((i) => i.id === id) ?? null
}

export async function updateItem(
  collection: string,
  id: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const items = await readJson(collection) as any[]
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...updates }
  await writeJson(collection, items)
  return items[idx]
}

export async function deleteItem(collection: string, id: string): Promise<boolean> {
  const items = await readJson(collection) as any[]
  const filtered = items.filter((i) => i.id !== id)
  if (filtered.length === items.length) return false
  await writeJson(collection, filtered)
  return true
}

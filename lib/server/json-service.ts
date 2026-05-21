import { promises as fs } from "fs"
import path from "path"

function dataPath(collection: string): string {
  const defaultDir = process.env.NODE_ENV === "production"
    ? "/tmp"
    : path.join(process.cwd(), "data")
  const dir = process.env.DATA_DIR ?? defaultDir
  return path.join(dir, `${collection}.json`)
}

async function ensureFile(filePath: string): Promise<void> {
  try {
    await fs.access(filePath)
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, "[]", "utf-8")
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJson(collection: string): Promise<any[]> {
  const fp = dataPath(collection)
  await ensureFile(fp)
  const text = await fs.readFile(fp, "utf-8")
  if (!text.trim()) return []
  try {
    return JSON.parse(text)
  } catch {
    console.warn(`Corrupted JSON in ${fp}, returning []`)
    return []
  }
}

export async function writeJson(collection: string, data: unknown): Promise<void> {
  const fp = dataPath(collection)
  const tmp = fp + ".tmp"
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8")
  await fs.rename(tmp, fp)
}

export async function appendItem(
  collection: string,
  item: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const items = await readJson(collection)
  items.push(item)
  await writeJson(collection, items)
  return item
}

export async function findById(
  collection: string,
  id: string
): Promise<Record<string, unknown> | null> {
  const items = await readJson(collection)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (items as any[]).find((i) => i.id === id) ?? null
}

export async function updateItem(
  collection: string,
  id: string,
  updates: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const items = await readJson(collection)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idx = (items as any[]).findIndex((i) => i.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...updates }
  await writeJson(collection, items)
  return items[idx] as Record<string, unknown>
}

export async function deleteItem(collection: string, id: string): Promise<boolean> {
  const items = await readJson(collection)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (items as any[]).filter((i) => i.id !== id)
  if (filtered.length === items.length) return false
  await writeJson(collection, filtered)
  return true
}

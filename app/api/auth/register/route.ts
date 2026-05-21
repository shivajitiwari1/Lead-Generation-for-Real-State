import { NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { hashPassword } from "@/lib/server/auth-utils"
import { readJson, writeJson } from "@/lib/server/json-service"
import { ok, err } from "@/lib/server/api-helpers"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return err("Username and password required", 400)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await readJson("settings") as any
  const data = Array.isArray(settings)
    ? { users: [], daily_email_count: 0, daily_email_date: "" }
    : settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: any[] = data.users ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (users.find((u: any) => u.username === username)) {
    return err("Username already taken", 400)
  }

  const user = {
    id: uuidv4(),
    username,
    hashed_password: await hashPassword(password),
    created_at: new Date().toISOString(),
  }
  users.push(user)
  data.users = users
  await writeJson("settings", data)

  return ok({ username: user.username, id: user.id })
}

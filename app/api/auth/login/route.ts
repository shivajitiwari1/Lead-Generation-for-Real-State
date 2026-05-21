import { NextRequest } from "next/server"
import { hashPassword, verifyPassword, createToken } from "@/lib/server/auth-utils"
import { readJson, writeJson } from "@/lib/server/json-service"
import { ok, err } from "@/lib/server/api-helpers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await readJson("settings") as any
  const data = Array.isArray(settings)
    ? { users: [], daily_email_count: 0, daily_email_date: "" }
    : settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[] = data.users ?? []

  // First-run: auto-create account if no users exist yet
  if (users.length === 0) {
    const newUser = {
      id: uuidv4(),
      username,
      hashed_password: await hashPassword(password),
      created_at: new Date().toISOString(),
    }
    users = [newUser]
    data.users = users
    await writeJson("settings", data)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = users.find((u: any) => u.username === username)
  if (!user || !(await verifyPassword(password, user.hashed_password))) {
    return err("Invalid credentials", 401)
  }

  const token = await createToken({ sub: user.id, username: user.username })
  const secure = process.env.COOKIE_SECURE !== "false"

  const response = ok({ access_token: token, username: user.username })
  response.headers.set(
    "Set-Cookie",
    `access_token=${token}; HttpOnly; SameSite=Lax; Max-Age=86400; Path=/${secure ? "; Secure" : ""}`
  )
  return response
}

import { NextRequest } from "next/server"
import { getCurrentUser, ok, err } from "@/lib/server/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) return err("Not authenticated", 401)
  return ok({ username: user.username, id: user.sub })
}

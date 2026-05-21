import { ok } from "@/lib/server/api-helpers"

export async function POST() {
  const response = ok({ message: "Logged out" })
  response.headers.set(
    "Set-Cookie",
    "access_token=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/"
  )
  return response
}

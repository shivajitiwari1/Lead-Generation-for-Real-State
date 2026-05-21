import * as jose from "jose"
import bcrypt from "bcryptjs"

const JWT_ALGORITHM = "HS256" as const
const JWT_EXPIRE_HOURS = parseInt(process.env.JWT_EXPIRE_HOURS ?? "24", 10)

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "lead-crm-demo-secret-2026"
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed)
}

export async function createToken(
  payload: Record<string, unknown>,
  expireHours?: number
): Promise<string> {
  const hours = expireHours ?? JWT_EXPIRE_HOURS
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setExpirationTime(`${hours}h`)
    .setIssuedAt()
    .sign(getSecret())
}

export async function decodeToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret(), {
      algorithms: [JWT_ALGORITHM],
    })
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

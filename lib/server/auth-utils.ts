import * as jose from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET ?? ""
const JWT_ALGORITHM = "HS256" as const
const JWT_EXPIRE_HOURS = parseInt(process.env.JWT_EXPIRE_HOURS ?? "24", 10)

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET env var must be set in production")
}
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set — using insecure dev default")
}

const _secret = new TextEncoder().encode(
  JWT_SECRET || "dev-secret-not-for-production"
)

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
    .sign(_secret)
}

export async function decodeToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jose.jwtVerify(token, _secret, {
      algorithms: [JWT_ALGORITHM],
    })
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

import { cookies } from 'next/headers'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { 
  getUserByEmail, 
  createUserInDb, 
  getUserById,
  type UserFormData
} from '@/lib/dal/users.dal'

function hashPassword(password: string, salt?: string) {
  const s = salt || randomBytes(16).toString('hex')
  const hashed = scryptSync(password, s, 64).toString('hex')
  return `${s}:${hashed}`
}

function verifyPassword(password: string, stored: string) {
  const [s, key] = stored.split(':')
  const derived = scryptSync(password, s, 64).toString('hex')
  const a = Buffer.from(key, 'hex')
  const b = Buffer.from(derived, 'hex')
  return timingSafeEqual(a, b)
}

export async function register(email: string, password: string, fullName?: string) {
  const exists = await getUserByEmail(email)
  if (exists) throw new Error('Email already registered')
  
  const password_hash = hashPassword(password)
  const userData: UserFormData = { email, password_hash, full_name: fullName }
  
  const user = await createUserInDb(userData)
  return user
}

export async function login(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) throw new Error('Invalid credentials')
  if (!verifyPassword(password, user.password_hash)) throw new Error('Invalid credentials')

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev_secret')
  const jwt = await new SignJWT({ sub: user.id, email: user.email })
    .setIssuedAt()
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
    
  const c = await cookies()
  c.set('session', jwt, { httpOnly: true, path: '/', sameSite: 'lax' })
  return { id: user.id, email: user.email, full_name: user.full_name }
}

export async function currentUser() {
  const c = await cookies()
  const token = c.get('session')?.value
  if (!token) return null
  
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev_secret')
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.sub
    if (!userId) return null

    const user = await getUserById(userId)
    return user
  } catch {
    return null
  }
}

export async function logout() {
  const c = await cookies()
  c.delete('session')
}

export const passwordUtils = { hashPassword, verifyPassword }

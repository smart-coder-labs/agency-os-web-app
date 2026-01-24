import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'

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
  // @ts-ignore prisma model present when users table exists
  const exists = await prisma.users.findUnique({ where: { email } })
  if (exists) throw new Error('Email already registered')
  const password_hash = hashPassword(password)
  // @ts-ignore prisma model present when users table exists
  const user = await prisma.users.create({ data: { email, password_hash, full_name: fullName ?? null } })
  return user
}

export async function login(email: string, password: string) {
  // @ts-ignore prisma model present when users table exists
  const user = await prisma.users.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid credentials')
  if (!verifyPassword(password, user.password_hash)) throw new Error('Invalid credentials')
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev_secret')
  const jwt = await new SignJWT({ sub: user.id, email: user.email })
    .setIssuedAt()
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
  cookies().set('session', jwt, { httpOnly: true, path: '/', sameSite: 'lax' })
  return { id: user.id, email: user.email, full_name: user.full_name }
}

export async function currentUser() {
  const token = cookies().get('session')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev_secret')
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.sub as string
    // @ts-ignore prisma model present when users table exists
    const user = await prisma.users.findUnique({ where: { id: userId } })
    return user
  } catch {
    return null
  }
}

export async function logout() {
  cookies().delete('session')
}

export const passwordUtils = { hashPassword, verifyPassword }

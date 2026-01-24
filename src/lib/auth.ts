import { compare, hash } from 'node:crypto'
// We'll implement simple email/password auth without NextAuth for now
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

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
  const exists = await prisma.users.findUnique({ where: { email } as any })
  if (exists) throw new Error('Email already registered')
  const password_hash = hashPassword(password)
  // @ts-expect-error: Prisma model will be generated after introspection
  const user = await prisma.users.create({ data: { email, password_hash, full_name: fullName ?? null } })
  return user
}

export async function login(email: string, password: string) {
  // @ts-expect-error prisma types after generate
  const user = await prisma.users.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid credentials')
  if (!verifyPassword(password, user.password_hash)) throw new Error('Invalid credentials')
  const token = randomBytes(32).toString('hex')
  // naive session table-less: store in cookie + DB token cache on user
  // @ts-expect-error after generate
  await prisma.users.update({ where: { id: user.id }, data: { context_token: token } }).catch(() => {})
  cookies().set('session', token, { httpOnly: true, path: '/', sameSite: 'lax' })
  return { id: user.id, email: user.email, full_name: user.full_name }
}

export async function currentUser() {
  const token = cookies().get('session')?.value
  if (!token) return null
  // @ts-expect-error after generate
  const user = await prisma.users.findFirst({ where: { context_token: token } })
  return user
}

export async function logout() {
  cookies().delete('session')
}

export const passwordUtils = { hashPassword, verifyPassword }

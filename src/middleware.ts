import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = [/^\/dashboard/, /^\/projects/, /^\/tasks/, /^\/users/]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const needsAuth = PROTECTED.some((re) => re.test(pathname))
  if (!needsAuth) return NextResponse.next()
  const session = req.cookies.get('session')?.value
  if (!session) {
    const url = new URL('/auth/signin', req.url)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

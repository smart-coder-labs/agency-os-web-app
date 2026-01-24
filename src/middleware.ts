import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = [/^\/dashboard/, /^\/projects/, /^\/tasks/, /^\/users/]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Handle root path
  if (pathname === '/') {
    const session = req.cookies.get('session')?.value
    if (session) {
       return NextResponse.redirect(new URL('/projects', req.url))
    }
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // Handle protected routes
  const needsAuth = PROTECTED.some((re) => re.test(pathname))
  if (needsAuth) {
    const session = req.cookies.get('session')?.value
    if (!session) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

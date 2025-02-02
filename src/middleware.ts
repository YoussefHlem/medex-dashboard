import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 1. Only specify public routes since everything else will be protected
const publicRoutes = ['/login']

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is public
  const path = req.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('userToken')
  const session = await cookie

  // 4. Allow access to public routes regardless of authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // 5. Redirect to /login if the user is not authenticated and trying to access any protected route
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // 6. Allow access to protected routes for authenticated users
  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}

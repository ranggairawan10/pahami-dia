import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// Defensive Middleware
// Tidak crash kalau env vars kosong atau Supabase down.
// Selalu return response, bahkan saat ada error.
// ============================================================

const PROTECTED_ROUTES = ['/app', '/admin', '/partner']
const GUEST_ONLY_ROUTES = [
  '/masuk',
  '/daftar',
  '/lupa-password',
  '/login',
  '/register',
]

export async function middleware(request: NextRequest) {
  // Default response - selalu siap jadi fallback
  const supabaseResponse = NextResponse.next({ request })

  // Cek env vars dulu. Kalau tidak ada, bypass middleware.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/masuk'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route)
    )

    if (isGuestOnlyRoute && user) {
      const url = request.nextUrl.clone()
      const redirectTo = url.searchParams.get('redirect')
      url.pathname =
        redirectTo && redirectTo.startsWith('/app')
          ? redirectTo
          : '/app/hari-ini'
      url.searchParams.delete('redirect')
      return NextResponse.redirect(url)
    }

    return response
  } catch (error) {
    // Kalau ada error apapun, bypass middleware - jangan crash
    console.error('Middleware error:', error)
    return supabaseResponse
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
}

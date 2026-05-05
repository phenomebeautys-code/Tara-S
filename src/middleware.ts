import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '../src/lib/locales'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Determine locale: TARA_LOCALE (user's explicit choice) wins,
  // then browser Accept-Language, then default.
  const cookieLocale = request.cookies.get('TARA_LOCALE')?.value
  const headerLang = request.headers.get('accept-language')?.split(',')[0].split('-')[0]
  const detectedLocale =
    (cookieLocale && (locales as readonly string[]).includes(cookieLocale) ? cookieLocale : null) ??
    (headerLang && (locales as readonly string[]).includes(headerLang) ? headerLang : null) ??
    defaultLocale

  // Build the base response and stamp NEXT_LOCALE immediately.
  // We do this once here and never recreate the response object,
  // so the cookie cannot be lost or reset mid-flight.
  const response = NextResponse.next({ request })
  response.cookies.set('NEXT_LOCALE', detectedLocale, { path: '/', sameSite: 'lax' })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
          // Re-stamp NEXT_LOCALE so Supabase cookie writes cannot overwrite it.
          response.cookies.set('NEXT_LOCALE', detectedLocale, { path: '/', sameSite: 'lax' })
        },
      },
    }
  )

  if (pathname === '/') {
    await supabase.auth.signOut()
    return response
  }

  const publicPaths = ['/login', '/signup', '/offline', '/auth']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))
  if (isPublic) return response

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (!pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_complete, locale')
      .eq('id', user.id)
      .single()

    // If the profile has a saved locale, use it as the authoritative source
    // and sync both cookies so the client and server stay in agreement.
    if (profile?.locale && (locales as readonly string[]).includes(profile.locale)) {
      response.cookies.set('TARA_LOCALE', profile.locale, { path: '/', sameSite: 'lax' })
      response.cookies.set('NEXT_LOCALE', profile.locale, { path: '/', sameSite: 'lax' })
    }

    if (profile && !profile.onboarding_complete) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
}

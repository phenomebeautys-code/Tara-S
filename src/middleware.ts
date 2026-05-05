import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { locales, defaultLocale } from '../src/lib/locales'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const cookieLocale = request.cookies.get('TARA_LOCALE')?.value
  const headerLang = request.headers.get('accept-language')?.split(',')[0].split('-')[0]
  const detectedLocale =
    (cookieLocale && (locales as readonly string[]).includes(cookieLocale) ? cookieLocale : null) ??
    (headerLang && (locales as readonly string[]).includes(headerLang) ? headerLang : null) ??
    defaultLocale

  let supabaseResponse = NextResponse.next({ request })
  supabaseResponse.cookies.set('NEXT_LOCALE', detectedLocale, { path: '/', sameSite: 'lax' })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set('NEXT_LOCALE', detectedLocale, { path: '/', sameSite: 'lax' })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  if (pathname === '/') {
    await supabase.auth.signOut()
    return supabaseResponse
  }

  const publicPaths = ['/login', '/signup', '/offline', '/auth']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))
  if (isPublic) return supabaseResponse

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

    if (profile?.locale && (locales as readonly string[]).includes(profile.locale)) {
      supabaseResponse.cookies.set('TARA_LOCALE', profile.locale, { path: '/', sameSite: 'lax' })
      supabaseResponse.cookies.set('NEXT_LOCALE', profile.locale, { path: '/', sameSite: 'lax' })
    }

    if (profile && !profile.onboarding_complete) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
}

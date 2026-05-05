import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, defaultLocale, type Locale } from './src/lib/locales'

// Re-export so existing imports from 'i18n' still resolve
export { locales, defaultLocale, type Locale } from './src/lib/locales'
export { localeNames } from './src/lib/locales'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()

  // TARA_LOCALE is set directly by the splash screen via document.cookie
  // before any navigation occurs, so it is always present on the incoming
  // request. NEXT_LOCALE is only set on the middleware response, meaning
  // it is one request behind and cannot be relied on here.
  const raw =
    (cookieStore.get('TARA_LOCALE')?.value as Locale | undefined) ??
    (cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined)

  const locale: Locale =
    raw && (locales as readonly string[]).includes(raw) ? raw : defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})

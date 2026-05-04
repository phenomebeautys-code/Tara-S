import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const supportedLocales = ['en', 'af', 'xh', 'zu'] as const
type Locale = typeof supportedLocales[number]

function isSupportedLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale)
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('locale')?.value ?? 'en'
  const locale: Locale = isSupportedLocale(raw) ? raw : 'en'
  const messages = (await import(`../../messages/${locale}.json`)).default
  return { locale, messages }
})

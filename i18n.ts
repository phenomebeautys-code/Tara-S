import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export const locales = ['en', 'af', 'zu', 'xh'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  }
})

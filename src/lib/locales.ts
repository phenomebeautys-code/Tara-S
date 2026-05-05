// Client-safe locale constants — no server imports.
// i18n.ts (root) imports FROM here so there is one source of truth.
export const locales = ['en', 'af', 'zu', 'xh'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
}

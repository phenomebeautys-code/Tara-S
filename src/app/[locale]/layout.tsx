// Locale segment — exists to satisfy next-intl routing.
// The provider lives in (app)/layout.tsx to avoid folder restructure.
import { locales } from '../../../i18n'
import type { ReactNode } from 'react'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}

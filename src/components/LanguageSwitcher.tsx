'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/lib/locales'
import { createBrowserClient } from '@supabase/ssr'

interface Props {
  currentLocale: Locale
  userId?: string
}

export default function LanguageSwitcher({ currentLocale, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as Locale
    document.cookie = `TARA_LOCALE=${newLocale}; path=/; samesite=lax`

    if (userId) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase.from('users').update({ locale: newLocale }).eq('id', userId)
    }

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      disabled={isPending}
      aria-label="Select language"
      style={{ opacity: isPending ? 0.5 : 1 }}
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  )
}

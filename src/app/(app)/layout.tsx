import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import BottomNav from '@/components/BottomNav'
import styles from './app-layout.module.css'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className={styles.shell}>
        <main className={styles.content}>{children}</main>
        <BottomNav />
      </div>
    </NextIntlClientProvider>
  )
}

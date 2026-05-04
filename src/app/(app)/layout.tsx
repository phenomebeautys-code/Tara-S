import { NextIntlClientProvider } from 'next-intl'
import BottomNav from '@/components/BottomNav'
import styles from './app-layout.module.css'
import messages from '../../../messages/en.json'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <div className={styles.shell}>
        <main className={styles.content}>{children}</main>
        <BottomNav />
      </div>
    </NextIntlClientProvider>
  )
}

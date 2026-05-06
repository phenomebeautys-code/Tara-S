'use client'
import BottomNav from '@/components/BottomNav'
import InactivityModal from '@/components/InactivityModal'
import { useOnlineSync } from '@/lib/hooks/useOnlineSync'
import styles from './app-layout.module.css'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useOnlineSync()

  return (
    <div className={styles.shell}>
      <main className={styles.content}>{children}</main>
      <BottomNav />
      <InactivityModal />
    </div>
  )
}

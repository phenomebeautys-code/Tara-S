import BottomNav from '@/components/BottomNav'
import InactivityModal from '@/components/InactivityModal'
import styles from './app-layout.module.css'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>{children}</main>
      <BottomNav />
      <InactivityModal />
    </div>
  )
}

import BottomNav from '@/components/BottomNav'
import styles from './app-layout.module.css'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>{children}</main>
      <BottomNav />
    </div>
  )
}

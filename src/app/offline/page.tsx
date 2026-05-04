export default function OfflinePage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', textAlign: 'center' }}>
      <span style={{ fontSize: '3rem' }}>🌿</span>
      <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 300, color: '#C4614A' }}>You&apos;re offline</h1>
      <p style={{ color: '#9B7E8E', maxWidth: '280px' }}>TARA-S needs a connection to sync your cycle data. Check your internet and try again.</p>
    </main>
  )
}

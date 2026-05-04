import { redirect } from 'next/navigation'

// This should never be reached — middleware handles routing.
// Fallback: send unauthenticated users to login.
export default function RootPage() {
  redirect('/login')
}

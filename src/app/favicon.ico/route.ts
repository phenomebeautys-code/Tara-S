import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.redirect(new URL('/icons/icon-192.png', process.env.NEXT_PUBLIC_APP_URL ?? 'https://tara-s.vercel.app'))
}

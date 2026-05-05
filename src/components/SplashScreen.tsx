'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './SplashScreen.module.css'

const QUOTES = [
  'She has always known her body.',
  'The body remembers what the mind forgets.',
  'No diet can substitute for the wisdom of your body.',
  'Your body hears everything your mind says.',
  'Everything I need already exists in me.',
  'What the world convinced her she lacked, she had within her all along.',
  'Understanding your body is the first step toward confidence.',
  'I am mine. Before I am ever anyone else\'s.',
  'Be softer with you.',
  'You have always been the answer.',
  'Your rhythm is your own.',
  'Every phase is the right phase.',
  'There is nothing shameful about being cyclical. Nature is too.',
  'Your cycle is not an inconvenience. It is information.',
  'She is proud of her body. With every cycle, she knows it is working.',
  'Flow with the tides rather than fight against them.',
  'Your changing energy is not a flaw. It is inner awareness.',
  'The moon does not apologise for her phases. Neither should you.',
  'Every cycle is a conversation your body is having with you. Listen.',
  'She tracked the moon long before she had a calendar.',
  'Rest is not weakness. It is wisdom.',
  'Slowing down is not falling behind.',
  'Honour the season you are in.',
  'Stillness is its own kind of strength.',
  'You are allowed to take up less space today.',
  'Some days, doing nothing is everything.',
  'Lighten up on yourself. No one is perfect.',
  'The season of rest is also a season of becoming.',
  'Even the earth rests between harvests.',
  'Give yourself the grace you give everyone else.',
  'tara-s. The woman. Whole. Specific. Herself.',
  'There is nothing more rare than a woman being unapologetically herself.',
  'Each individual woman\'s body demands to be accepted on its own terms.',
  'To love yourself as you are is a miracle.',
  'You are not a problem to be solved.',
  'My body is my vessel. An archive of experiences.',
  'Women who know themselves change everything.',
  'You were made from the oldest knowing on earth.',
  'The wisdom passed between generations was never lost. It was waiting.',
  'Born in the south. Rooted in the oldest land.',
  'i love myself. the quietest. simplest. most powerful revolution. ever.',
  'Learn to love yourself through it.',
  'You are not behind. You are exactly where you are.',
  'Loving yourself is the greatest revolution.',
  'We cannot hate ourselves into a version of ourselves we can love.',
  'Self-love is the only ocean you can never drown in.',
  'You are more powerful than you know.',
  'It\'s not your job to like me. It\'s mine.',
  'Beauty is realising that you are the beholder.',
  'The love she chose to give herself started a revolution in her bones.',
  'Courage is like a muscle. We strengthen it by use.',
  'The most effective way to do it, is to do it.',
  'You are strong, especially on the hard days.',
  'She kept going. That was enough.',
  'Some battles only you will ever understand. You won them anyway.',
  'Your body has carried you this far. Trust it.',
  'When we are awake in our bodies, the world comes alive.',
  'You do not need to earn rest, joy, or softness.',
  'The oldest cultures on earth knew: the woman is the centre.',
  'She logs. She learns. She knows herself a little more today.',
]

function getFormattedDate() {
  return new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return QUOTES[dayOfYear % QUOTES.length]
}

interface Props {
  onEnter: () => void
  preloadDone: boolean
}

export default function SplashScreen({ onEnter, preloadDone }: Props) {
  const [visible, setVisible] = useState(false)
  const quote = getDailyQuote()
  const date = getFormattedDate()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`${styles.splash} ${visible ? styles.visible : ''}`}>
      <div className={styles.inner}>
        <p className={styles.date}>{date}</p>
        <h1 className={`display ${styles.logo}`}>TARA-S</h1>
        <p className={`display ${styles.quote}`}>{quote}</p>
      </div>
      <div className={styles.bottom}>
        <button
          className={`${styles.enterBtn} ${preloadDone ? styles.ready : ''}`}
          onClick={onEnter}
          disabled={!preloadDone}
        >
          {preloadDone ? 'Enter' : 'One moment...'}
        </button>
      </div>
    </div>
  )
}

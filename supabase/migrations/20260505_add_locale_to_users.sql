-- Migration: Add locale preference column to users table
-- Stores ISO language code: 'en' | 'af' | 'zu' | 'xh'
-- Defaults to English. Updated via LanguageSwitcher component or onboarding selection.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en'
  CHECK (locale IN ('en', 'af', 'zu', 'xh'));

COMMENT ON COLUMN users.locale IS
  'User language preference (ISO code). Read by middleware to set NEXT_LOCALE cookie for next-intl server-side rendering.';

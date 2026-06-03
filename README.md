# TARA-S

> *tara-s* — "the woman" in Khoekhoegowab (Khoi-San), the oldest indigenous language family of Southern Africa.

TARA-S is a women's cycle tracking PWA built by [Phenome](https://phenomebeauty.co.za) for South African women. It helps users track their menstrual cycle, predict their next period, and avoid booking beauty appointments during their period window.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Backend:** Supabase (Auth, Postgres, RLS)
- **i18n:** next-intl (English, Zulu, Xhosa, Afrikaans)
- **Hosting:** Vercel (recommended)
- **Type:** Progressive Web App (PWA)

## Getting Started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Project Structure

```
src/
  app/
    (auth)/login/        # Magic link login
    (app)/               # Main app shell (bottom nav)
      page.tsx           # Home — Today card
      onboarding/        # 3-step period log onboarding
      log/               # Period + symptom logger
      insights/          # Personal cycle insights
      privacy/           # POPIA data transparency page
    auth/callback/       # Supabase auth callback
    offline/             # PWA offline fallback
  components/
    TodayCard            # Home screen hero — phase, countdown, CTA
    BottomNav            # Fixed bottom navigation
    PwaPrompt            # "Add to home screen" nudge
  lib/
    supabase/            # Browser + server + middleware clients
    hooks/               # useCycleStats, usePeriodLogs
  i18n/                  # next-intl config
messages/                # en, zu, xh, af translation strings
public/
  manifest.json          # PWA manifest
  sw.js                  # Service worker
```

## Database

All schema + logic lives in Supabase migrations:

| Migration | Purpose |
|---|---|
| `initial_schema` | Tables: users, period_logs, cycle_stats, symptom_logs, appointments |
| `security_hardening` | Locked search_path, revoked anon execute |
| `cycle_logic_functions` | compute_cycle_stats, get_appointment_risk, get_cycle_phase, get_personal_insights |

## POPIA Compliance

- All tables have RLS — users access only their own data
- Cascade deletes — one user deletion wipes all related data
- One-tap CSV export and account deletion in `/privacy`
- 
- No analytics, no third-party data sharing

## Roadmap

See the full POA in the research document.

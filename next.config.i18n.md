# i18n Integration — Next Steps

Translation files and i18n config are ready.

## To fully activate next-intl:

### 1. Install the package
```bash
npm install next-intl
```

### 2. Update next.config.js
```js
const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin()
module.exports = withNextIntl({})
```

### 3. Restructure app folder
Move all pages under `src/app/[locale]/` so the URL reflects the locale:
```
src/app/[locale]/(app)/log/page.tsx
src/app/[locale]/(app)/insights/page.tsx
...
```

### 4. Update middleware.ts
Compose next-intl locale detection with existing Supabase auth middleware.

### 5. Replace hardcoded strings
In each page, import `useTranslations` from `next-intl` and replace static strings:
```tsx
const t = useTranslations('log')
// <h2>{t('section_period')}</h2>
```

### 6. Strings flagged for human review
Search the Zulu and Xhosa files for `NEEDS HUMAN REVIEW` before launching those languages publicly.
Consider labelling zu and xh as 'Beta' in the language selector.

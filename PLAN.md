# BaTip Site Implementation Plan

## Safety

- Keep `/Volumes/Transcend/Applications/batip-support` untouched.
- Build this site in the separate `batip-site` repository.
- Do not change DNS, `CNAME`, Google Play, or App Store URLs during Phase 1-3.

## Phases

| Phase | Scope | Status | Commit |
| --- | --- | --- | --- |
| 1 | Foundation: static generator, locale registry, EN/VI skeleton routes, language detection, copied Hi Morse assets | Completed | Pending commit |
| 2 | Content: EN/VI home, Hi Morse marketing, support, legal hub, privacy policy | Pending | Pending |
| 3 | Design and QA: visual polish, responsive checks, metadata, hreflang, accessibility pass | Pending | Pending |
| 4 | Launch: CNAME, GitHub Pages, DNS, HTTPS, store URL updates | Out of scope now | Pending |

## Locale Registry

The site registry mirrors the 47 locales from `Learn-Morse`:

```text
ar, bg, ca, cs, da, de, el,
en, en-AU, en-GB, en-US,
es, es-419, es-ES, es-MX,
fi, fr, fr-CA, fr-FR,
he, hi, hr, hu, id, it, ja, ko, ms,
nl, no, pl,
pt, pt-BR, pt-PT,
ro, ru, sk, sr, sv, th, tr, uk, vi,
zh, zh-Hans, zh-Hant, zh-Hant-HK
```

Initial published locales:

```text
en
vi
```

All other locales are registered for future expansion and currently fall back to English.

## Stable URLs

```text
/{locale}/
/{locale}/apps/hi-morse/
/{locale}/support/hi-morse/
/{locale}/legal/
/{locale}/legal/hi-morse/privacy/
```

Store URLs should use explicit locale paths, not the auto-detect root.

## Hi Morse Assets

Selected assets are copied from:

```text
/Volumes/Transcend/Applications/Learn-Morse/learn_morse
```

Deployable HTML must reference copied assets under:

```text
/assets/hi-morse/
```

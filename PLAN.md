# BaTip Site Implementation Plan

## Safety

- Keep `/Volumes/Transcend/Applications/batip-support` untouched.
- Build this site in the separate `batip-site` repository.
- Do not change DNS, `CNAME`, Google Play, or App Store URLs during Phase 1-3.

## Phases

| Phase | Scope | Status | Commit |
| --- | --- | --- | --- |
| 1 | Foundation: static generator, locale registry, EN/VI skeleton routes, language detection, copied Hi Morse assets | Completed | `093815f` |
| 2 | Content: EN/VI home, Hi Morse marketing, support, legal hub, privacy policy | Completed | `1bd9bf8` |
| 3 | Design and QA: visual polish, responsive checks, metadata, hreflang, accessibility pass | Completed | This commit |
| 4 | Launch: CNAME, GitHub Pages, DNS, HTTPS, store URL updates | In progress | This commit |

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

## Phase 2 Content Notes

- EN/VI home, marketing, support, legal hub, and privacy content are now present.
- Privacy content follows the current Hi Morse privacy source, including local data, clipboard use, flashlight behavior, Firebase Crashlytics, feedback email, third-party services, retention, security, translations, and contact.
- English remains the controlling source version for translated legal content unless a translation is explicitly reviewed otherwise.

## Phase 3 QA Notes

- Added richer page metadata, Open Graph tags, canonical URLs, and `hreflang` alternates.
- Added a generated 404 page.
- Expanded the check script to validate internal links, asset references, required metadata, and generated AppleDouble cleanup.
- Polished the app page visual system with the Hi Morse feature graphic, icon, screenshot strip, FAQ styling, and active navigation states.
- Verified desktop and mobile layouts with Chrome DevTools Protocol screenshots. The checked 390px mobile pages have no horizontal overflow.

## Phase 4 Launch Notes

- Added root `CNAME` with `batip.app`.
- Added GitHub Actions workflow at `.github/workflows/pages.yml`.
- The workflow builds `dist/`, runs checks, uploads the Pages artifact, and deploys with `actions/deploy-pages`.
- GitHub Pages source should be set to GitHub Actions in the repository UI.
- Custom domain still needs to be set in GitHub Pages Settings because GitHub ignores `CNAME` for custom Actions publishing workflows.
- DNS for `batip.app` should point the apex domain to GitHub Pages:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

- Enable HTTPS in GitHub Pages after DNS is verified.

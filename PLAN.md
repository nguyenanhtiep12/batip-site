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
| 4 | Launch: CNAME, GitHub Pages, DNS, HTTPS, store URL updates | Partially completed | `677bf0b` |

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

Full site content is currently published for:

```text
en
vi
ja
ko
zh-Hans
zh-Hant
es-MX
pt-BR
id
```

Hi Morse store landing pages are generated for the App Store metadata and screenshot locales currently supported:

```text
en
vi
ja
ko
zh-Hans
zh-Hant
es-MX
pt-BR
id
```

Home, Hi Morse marketing, support, legal hub, and privacy policy pages are localized for the published App Store locale set. Outside those App Store locales, store marketing should fall back to `/en/apps/hi-morse/` / en-US metadata.

## Stable URLs

```text
/{locale}/
/{locale}/apps/hi-morse/
/{locale}/support/hi-morse/
/{locale}/legal/
/{locale}/legal/hi-morse/privacy/
```

Non-locale auto-detect entry points:

```text
/apps/hi-morse/
/support/hi-morse/
```

Store URLs should use explicit locale paths, not the auto-detect root.

Current Hi Morse store landing URLs:

```text
/apps/hi-morse/
/vi/apps/hi-morse/
/ja/apps/hi-morse/
/ko/apps/hi-morse/
/zh-Hans/apps/hi-morse/
/zh-Hant/apps/hi-morse/
/es-MX/apps/hi-morse/
/pt-BR/apps/hi-morse/
/id/apps/hi-morse/
```

Default/fallback:

```text
/en/apps/hi-morse/
```

The non-locale `/apps/hi-morse/` URL is an auto-detect entry point. It redirects to the best supported App Store landing locale and falls back to `/en/apps/hi-morse/`.

## Store Links

Hi Morse store buttons currently point to:

```text
App Store: https://apps.apple.com/app/hi-morse-learn-morse-code/id6768256456
```

Android is currently configured as `closedTesting` in `src/data/apps.json`. The Google Play details URL is kept in config for the production switch, but the public site does not expose it while no tester opt-in URL is configured. The rendered Android button is a localized disabled closed-testing state.

Android release switches:

```text
Closed testing with no public tester link:
googlePlayStatus = closedTesting

Closed testing with a Play Console opt-in link:
googlePlayStatus = closedTesting
googlePlayTesterUrl = <tester opt-in URL>

Production:
googlePlayStatus = production
```

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

- Home, marketing, support, legal hub, and privacy content are now present for `en`, `vi`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `es-MX`, `pt-BR`, and `id`.
- Privacy content follows `/Volumes/Transcend/Applications/batip-legal/hi-morse/index.md`, including local data, clipboard use, flashlight behavior, Firebase Crashlytics, feedback email, third-party services, retention, security, translations, and contact.
- English remains the controlling source version for translated legal content unless a translation is explicitly reviewed otherwise.
- The English privacy policy remains the controlling source in case of translation inconsistency.

## Phase 3 QA Notes

- Added richer page metadata, Open Graph tags, canonical URLs, and `hreflang` alternates.
- Added root favicon, Apple touch icon, web app manifest, and PNG icon sizes generated from the Hi Morse app icon.
- Added a generated 404 page.
- Expanded the check script to validate internal links, asset references, required metadata, published locale content completeness, and generated/source AppleDouble cleanup.
- Polished the app page visual system with the Hi Morse feature graphic, icon, screenshot strip, FAQ styling, and active navigation states.
- Fixed the legal hub document card so it no longer reuses the app icon card grid, preventing wrapped words on `/en/legal/`.
- Verified desktop and mobile layouts with Chrome DevTools Protocol screenshots. The checked 390px mobile pages have no horizontal overflow.

## Phase 4 Launch Notes

- Added root `CNAME` with `batip.app`.
- Added GitHub Actions workflow at `.github/workflows/pages.yml`.
- The workflow builds `dist/`, runs checks, uploads the Pages artifact, and deploys with `actions/deploy-pages`.
- GitHub Pages source is set to GitHub Actions in the repository UI.
- Custom domain is set to `batip.app` in GitHub Pages Settings.
- DNS for `batip.app` points the apex domain to GitHub Pages:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

- `www.batip.app` is configured as `CNAME -> nguyenanhtiep12.github.io.`.
- `https://batip.app/` is live and returns `HTTP/2 200`.
- `Enforce HTTPS` is enabled for the primary domain.
- GitHub Pages currently reports DNS check in progress after adding the `www` record.
- `https://www.batip.app/` resolves to GitHub Pages, but the certificate is still pending refresh for the `www` hostname.

## Remaining Launch Follow-up

- Wait for GitHub Pages to finish DNS and certificate refresh for `www.batip.app`.
- Re-check `https://www.batip.app/` before treating `www` as ready.
- Review the production content at `https://batip.app/`.
- Add `googlePlayTesterUrl` if Android closed testing should accept testers from the public site.
- Switch `googlePlayStatus` to `production` when the Android app is publicly available.
- After content review, update Google Play and App Store URLs to the new explicit locale paths.
- Keep the old support and legal subdomains online until store URL changes are approved and stable.

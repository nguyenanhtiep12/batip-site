# BaTip Site

Static source for the future `batip.app` website.

## Status

This repository now serves the production `batip.app` website through GitHub Pages.

The existing `batip-support` repository and the legacy `support.batip.app` / `legal.batip.app` DNS records are intentionally left untouched until the store URLs are migrated and reviewed.

## Commands

```sh
npm run build
npm run check
npm run serve
```

The local server serves the generated `dist/` folder at:

```text
http://localhost:4173/
```

## Site Icons

The website icon set is generated from the Hi Morse 1024px app icon and published from the site root:

```text
/favicon.ico
/favicon-16x16.png
/favicon-32x32.png
/apple-touch-icon.png
/icon-192.png
/icon-512.png
/site.webmanifest
```

## Launch

GitHub Pages is configured with GitHub Actions. The repository contains `CNAME` with:

```text
batip.app
```

The custom domain is also set in GitHub:

```text
Repository Settings -> Pages -> Custom domain -> batip.app
```

Pages source is set to GitHub Actions and HTTPS is enforced.

## Locales

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

Hi Morse pages are generated for the App Store metadata and screenshot locales currently supported:

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

These landing URLs are available under:

```text
/{locale}/apps/hi-morse/
```

The non-locale marketing URL also exists and redirects users to the best supported landing locale:

```text
/apps/hi-morse/
```

The non-locale support URL redirects users to the best supported full-site locale:

```text
/support/hi-morse/
```

The default/fallback marketing URL remains:

```text
/en/apps/hi-morse/
```

Home, Hi Morse marketing, support, legal hub, and privacy policy pages are localized for the published locale set. The English privacy policy remains the controlling source if a translation is inconsistent.

## Store Links

Hi Morse store buttons use:

```text
App Store: https://apps.apple.com/app/hi-morse-learn-morse-code/id6768256456
```

Android is currently marked as closed testing in `src/data/apps.json`. Without a tester opt-in URL, the public site renders a disabled localized "Android closed testing" button instead of linking to the Google Play details URL.

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

## Legal Source

The Hi Morse privacy policy content follows:

```text
/Volumes/Transcend/Applications/batip-legal/hi-morse/index.md
```

## DNS

The `batip.app` apex domain uses GitHub Pages `A` records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

The `www` host uses:

```text
CNAME www -> nguyenanhtiep12.github.io.
```

Current launch status as of 2026-05-15:

- `https://batip.app/` is live and returns `HTTP/2 200`.
- `https://batip.app/` redirects users to the detected locale, with English as fallback.
- GitHub Pages shows the custom domain DNS check in progress after the `www` record was added.
- `https://www.batip.app/` resolves to GitHub Pages, but the `www` certificate is still pending refresh.

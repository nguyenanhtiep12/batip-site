# BaTip Site Plan

## Goal

Build a new static site for `batip.app` as the future main home for BaTip apps, app marketing pages, support pages, and legal documents.

The existing `batip-support` site should remain untouched during this phase.

## Safety Strategy

- Do not modify the existing `batip-support` repository.
- Do not change `support.batip.app`.
- Do not redirect old domains yet.
- Do not remove old links.
- Do not update Google Play or App Store URLs until the new site is reviewed and stable.
- Build the new site in a separate repository, proposed name: `batip-site`.

## Proposed Domain

```text
https://batip.app/
```

The new repository should contain:

```text
CNAME
```

with:

```text
batip.app
```

DNS and GitHub Pages setup should happen only after local review is complete.

## URL Structure

The root URL detects the user's preferred language and redirects to the best published locale:

```text
https://batip.app/
```

Initial English URLs:

```text
https://batip.app/en/
https://batip.app/en/apps/hi-morse/
https://batip.app/en/support/hi-morse/
https://batip.app/en/legal/
https://batip.app/en/legal/hi-morse/privacy/
```

Initial Vietnamese URLs:

```text
https://batip.app/vi/
https://batip.app/vi/apps/hi-morse/
https://batip.app/vi/support/hi-morse/
https://batip.app/vi/legal/
https://batip.app/vi/legal/hi-morse/privacy/
```

The stable store URLs should use explicit locale paths, not the auto-detect root. For example:

```text
https://batip.app/en/apps/hi-morse/
https://batip.app/en/support/hi-morse/
https://batip.app/en/legal/hi-morse/privacy/
```

## Language Strategy

Use the locale list from:

```text
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/lib/l10n/app_*.arb
```

Supported locale registry:

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

Initial published content:

```text
en
vi
```

Rules:

- English is the source language.
- Vietnamese is published from the start.
- Other locales are registered for future expansion but should not be presented as reviewed legal translations until content is ready.
- If a browser locale is not published, fall back to `/en/`.
- If the user manually selects a language, save that choice in `localStorage`.
- Support right-to-left layout for `ar` and `he` from the start.
- Keep route slugs in English for long-term stability:

```text
/{locale}/apps/hi-morse/
/{locale}/support/hi-morse/
/{locale}/legal/hi-morse/privacy/
```

## Pages

### Home

Purpose:

- Introduce BaTip as the app publisher.
- Show the current app list.
- Link to app marketing, support, and privacy pages.

Initial app:

```text
Hi Morse
```

### Hi Morse Marketing Page

URL:

```text
/{locale}/apps/hi-morse/
```

Purpose:

- This is the app website or marketing URL for stores.
- Explain what Hi Morse does.
- Show the app icon and product visuals.
- Link to Google Play.
- Reserve space for App Store link later.
- Link to support and privacy pages.

Core app description:

- Learn Morse code.
- Translate text to Morse and Morse to text.
- Listen to Morse audio.
- Use flash playback and flash feedback.
- Practice listening and dot/dash input.

### Hi Morse Support Page

URL:

```text
/{locale}/support/hi-morse/
```

Content:

- Support email.
- Checklist before contacting support.
- FAQ.
- Device/app-version reporting guidance.
- Link to privacy policy.

### Legal Hub

URL:

```text
/{locale}/legal/
```

Content:

- List legal documents by app.
- Link to Hi Morse Privacy Policy.

### Hi Morse Privacy Policy

URL:

```text
/{locale}/legal/hi-morse/privacy/
```

Content basis:

- Hi Morse does not require an account.
- App preferences are stored locally on the user's device.
- Practice progress/data is stored locally on the user's device.
- Morse text/input is processed on the user's device.
- Flashlight access is used only when the user chooses flash playback or flash feedback.
- Include support/contact email.
- Include `Effective date`.
- Include `Last updated`.
- Include translation status if needed.
- For translated legal pages, English should remain the source version unless a translated version is explicitly reviewed.

## Visual Assets For Hi Morse

Use images from the existing `Learn-Morse` project when designing the Hi Morse pages.

Primary brand assets:

```text
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/assets/brand/hi_morse_icon_1024.png
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/assets/brand/hi_morse_splash_logo.png
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/web/icons/Icon-512.png
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/web/icons/Icon-maskable-512.png
```

Google Play assets:

```text
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/google_play/en-US/graphics/app_icon_512.png
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/google_play/en-US/graphics/feature_graphic_1024x500.png
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/google_play/en-US/screenshots/phone/
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/google_play/en-US/screenshots/7-inch/
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/google_play/en-US/screenshots/10-inch/
```

App Store assets:

```text
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/app_store/en-US/screenshots/iphone-6.9/
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/app_store/en-US/screenshots/ipad-13/
```

Draft marketing explorations can be used for inspiration or reviewed manually before reuse:

```text
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/drafts/marketing_preview_v2_google_play/
/Volumes/Transcend/Applications/Learn-Morse/learn_morse/store_metadata/drafts/marketing_style_exploration_google_play/
```

Implementation notes:

- Copy selected assets into the new `batip-site` repository during implementation.
- Do not reference absolute local filesystem paths in deployed HTML.
- Avoid using screenshots with English text on non-English pages unless the page is intentionally showing English store assets.
- Prefer app icon, splash logo, and carefully selected screenshots that make the product clear.

## Technical Approach

- Static site.
- Deploy with GitHub Pages.
- No backend.
- No paid host required.
- Use a lightweight build step to generate locale-specific pages.
- Keep content separate from layout.

Suggested structure:

```text
batip-site/
  CNAME
  package.json
  src/
    layouts/
    pages/
    data/
      locales.json
      apps.json
  content/
    en/
      home.json
      apps/hi-morse.json
      support/hi-morse.json
      legal/hi-morse/privacy.md
    vi/
      home.json
      apps/hi-morse.json
      support/hi-morse.json
      legal/hi-morse/privacy.md
  public/
    assets/
      hi-morse/
  dist/
```

`dist/` should contain the generated static site for GitHub Pages, depending on the final deployment setup.

## Design Direction

- Clean, focused, trustworthy.
- Avoid a flashy landing-page feel.
- Make the product visible in the first viewport on the Hi Morse page.
- Use real app assets/screenshots instead of abstract decoration.
- Keep navigation predictable:

```text
BaTip
Apps
Support
Legal
Contact
Language
```

## DNS Later

When the site is ready and reviewed, configure `batip.app` DNS for GitHub Pages.

Root domain `A` records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Then enable HTTPS in GitHub Pages when available.

## Out Of Scope For This Phase

- Modify `batip-support`.
- Redirect `support.batip.app`.
- Delete old support/legal pages.
- Update Google Play or App Store URLs.
- Publish unreviewed legal translations.
- Create paid hosting or backend infrastructure.

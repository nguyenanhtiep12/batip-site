import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const baseUrl = 'https://batip.app';

const locales = readJson('src/data/locales.json');
const apps = readJson('src/data/apps.json');
const publishedLocales = locales.filter((locale) => locale.published);
const appLandingLocales = locales.filter((locale) => locale.published || locale.storeLanding);
const landingOnlyLocales = appLandingLocales.filter((locale) => !locale.published);
const app = apps.find((entry) => entry.id === 'hi-morse');
const localeContent = new Map();

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(publicDir, distDir, { recursive: true });

writeFile(
  'index.html',
  renderLanguageDetectPage({
    publishedLocales,
    fallbackLocale: 'en',
  }),
);
writeFile(
  'apps/hi-morse/index.html',
  renderAppLanguageDetectPage({
    appLandingLocales,
    fallbackLocale: 'en',
  }),
);

for (const locale of publishedLocales) {
  const content = readLocaleContent(locale);

  writePage({
    locale,
    content,
    pageKey: 'home',
    urlPath: `/${locale.tag}/`,
    main: renderHome({ locale, content, app }),
  });

  writePage({
    locale,
    content,
    pageKey: 'app',
    urlPath: `/${locale.tag}/apps/hi-morse/`,
    main: renderAppPage({ locale, content, app }),
    alternateLocales: appLandingLocales,
    switcherLocales: appLandingLocales,
  });

  writePage({
    locale,
    content,
    pageKey: 'support',
    urlPath: `/${locale.tag}/support/hi-morse/`,
    main: renderSupportPage({ locale, content }),
  });

  writePage({
    locale,
    content,
    pageKey: 'legal',
    urlPath: `/${locale.tag}/legal/`,
    main: renderLegalHub({ locale, content }),
  });

  writePage({
    locale,
    content,
    pageKey: 'privacy',
    urlPath: `/${locale.tag}/legal/hi-morse/privacy/`,
    main: renderPrivacyPage({ content }),
  });
}

for (const locale of landingOnlyLocales) {
  const content = readLocaleContent(locale);

  writePage({
    locale,
    content,
    pageKey: 'app',
    urlPath: `/${locale.tag}/apps/hi-morse/`,
    main: renderAppPage({ locale, content, app }),
    alternateLocales: appLandingLocales,
    switcherLocales: appLandingLocales,
  });
}

writeFile('robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://batip.app/sitemap.xml\n');
writeFile('sitemap.xml', renderSitemap());
writeFile('404.html', renderNotFoundPage());
removeAppleDoubleFiles(distDir);

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function readLocaleContent(locale) {
  const contentTag = locale.contentFallback ?? locale.tag;
  if (!localeContent.has(contentTag)) {
    localeContent.set(contentTag, readJson(`content/${contentTag}/site.json`));
  }
  return localeContent.get(contentTag);
}

function writePage({
  locale,
  content,
  pageKey,
  urlPath,
  main,
  alternateLocales = publishedLocales,
  switcherLocales = publishedLocales,
}) {
  writeFile(
    path.join(urlPath.slice(1), 'index.html'),
    renderDocument({
      locale,
      content,
      pageKey,
      urlPath,
      main,
      alternateLocales,
      switcherLocales,
    }),
  );
}

function writeFile(relativePath, contents) {
  const absolutePath = path.join(distDir, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
}

function renderDocument({ locale, content, pageKey, urlPath, main, alternateLocales, switcherLocales }) {
  const page = content[pageKey];
  const canonical = `${baseUrl}${urlPath}`;
  const alternateLinks = renderAlternateLinks(urlPath, alternateLocales);
  const fullSiteTag = locale.published ? locale.tag : (locale.fullSiteFallback ?? 'en');
  const appHref = `/${locale.tag}/apps/hi-morse/`;
  const supportHref = `/${fullSiteTag}/support/hi-morse/`;
  const legalHref = `/${fullSiteTag}/legal/`;

  return `<!doctype html>
<html lang="${escapeAttr(locale.tag)}" dir="${escapeAttr(locale.dir)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)} | BaTip</title>
    <meta name="description" content="${escapeAttr(page.description)}">
    <link rel="canonical" href="${canonical}">
${alternateLinks}
    <meta property="og:site_name" content="BaTip">
    <meta property="og:title" content="${escapeAttr(`${page.title} | BaTip`)}">
    <meta property="og:description" content="${escapeAttr(page.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${baseUrl}/assets/hi-morse/feature-graphic-1024x500.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#07130f">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="stylesheet" href="/assets/styles.css">
    <script defer src="/assets/site.js"></script>
  </head>
  <body data-locale="${escapeAttr(locale.tag)}">
    <header class="site-header">
      <nav class="shell nav" aria-label="Primary">
        <a class="brand" href="/${fullSiteTag}/" aria-label="BaTip home">BaTip</a>
        <div class="nav-links">
          ${renderNavLink(appHref, content.common.nav.apps, urlPath)}
          ${renderNavLink(supportHref, content.common.nav.support, urlPath)}
          ${renderNavLink(legalHref, content.common.nav.legal, urlPath)}
          <a href="mailto:${escapeAttr(content.common.contactEmail)}">${escapeHtml(content.common.nav.contact)}</a>
        </div>
        ${renderLanguageSwitcher({ locale, content, urlPath, switcherLocales })}
      </nav>
    </header>
    <main>
${main}
    </main>
    <footer class="footer">
      <div class="shell footer-grid">
        <p>${escapeHtml(content.common.footer)}</p>
        <div class="footer-links">
          <a href="${supportHref}">${escapeHtml(content.common.nav.support)}</a>
          <a href="${legalHref}">${escapeHtml(content.common.nav.legal)}</a>
          <a href="mailto:${escapeAttr(content.common.contactEmail)}">${escapeHtml(content.common.contactEmail)}</a>
        </div>
      </div>
    </footer>
  </body>
</html>
`;
}

function renderNavLink(href, label, currentPath) {
  const current = href === currentPath ? ' aria-current="page"' : '';
  return `<a href="${escapeAttr(href)}"${current}>${escapeHtml(label)}</a>`;
}

function renderAlternateLinks(urlPath, alternateLocales) {
  const currentTag = urlPath.split('/').filter(Boolean)[0];
  const suffix = urlPath.replace(`/${currentTag}/`, '/');
  const links = alternateLocales.map((locale) => {
    const href = `${baseUrl}/${locale.tag}${suffix}`;
    return `    <link rel="alternate" hreflang="${escapeAttr(locale.tag)}" href="${href}">`;
  });
  links.push(`    <link rel="alternate" hreflang="x-default" href="${baseUrl}/en${suffix}">`);
  return links.join('\n');
}

function renderLanguageSwitcher({ locale, content, urlPath, switcherLocales }) {
  const options = switcherLocales
    .map((entry) => {
      const selected = entry.tag === locale.tag ? ' selected' : '';
      return `<option value="${escapeAttr(entry.tag)}"${selected}>${escapeHtml(entry.nativeName)}</option>`;
    })
    .join('');

  return `<label class="language-switcher">
          <span>${escapeHtml(content.common.language)}</span>
          <select aria-label="${escapeAttr(content.common.language)}" data-language-switcher data-current-path="${escapeAttr(urlPath)}">
            ${options}
          </select>
        </label>`;
}

function renderHome({ locale, content, app }) {
  const page = content.home;
  return `      <section class="hero">
        <div class="shell hero-grid">
          <div>
            <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
            <h1>${escapeHtml(page.headline)}</h1>
            <p class="lead">${escapeHtml(page.lead)}</p>
          </div>
          <div class="product-visual" aria-label="Hi Morse preview">
            <img class="hero-icon" src="${escapeAttr(app.icon)}" alt="Hi Morse app icon" width="192" height="192">
            <img class="feature-graphic" src="${escapeAttr(app.featureGraphic)}" alt="" width="1024" height="500">
          </div>
        </div>
      </section>
      <section class="section">
        <div class="shell">
          <h2>${escapeHtml(page.appsHeading)}</h2>
          <div class="app-card">
            <img src="${escapeAttr(app.icon)}" alt="" width="80" height="80">
            <div>
              <h3>${escapeHtml(app.name)}</h3>
              <p>${escapeHtml(page.appSummary)}</p>
              <div class="actions">
                <a class="button" href="/${locale.tag}/apps/hi-morse/">${escapeHtml(content.common.nav.apps)}</a>
                <a class="button secondary" href="/${locale.tag}/support/hi-morse/">${escapeHtml(content.common.nav.support)}</a>
                <a class="button secondary" href="/${locale.tag}/legal/hi-morse/privacy/">${escapeHtml(content.common.nav.legal)}</a>
              </div>
            </div>
          </div>
        </div>
      </section>`;
}

function renderAppPage({ locale, content, app }) {
  const page = content.app;
  const fullSiteTag = locale.published ? locale.tag : (locale.fullSiteFallback ?? 'en');
  const features = page.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
  const appStoreLabel = page.appStore ?? page.appStoreComing ?? 'App Store';
  const appStoreButton = app.appStoreUrl
    ? `<a class="button" href="${escapeAttr(app.appStoreUrl)}">${escapeHtml(appStoreLabel)}</a>`
    : `<span class="button disabled" aria-disabled="true">${escapeHtml(page.appStoreComing)}</span>`;
  const screenshots = app.screenshots
    .map((screenshot) => {
      const alt = content.alts[screenshot.altKey] ?? app.name;
      return `<figure>
              <img src="${escapeAttr(screenshot.src)}" alt="${escapeAttr(alt)}" loading="lazy">
            </figure>`;
    })
    .join('');

  return `      <section class="hero">
        <div class="shell hero-grid">
          <div>
            <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
            <h1>${escapeHtml(page.headline)}</h1>
            <p class="lead">${escapeHtml(page.lead)}</p>
            <div class="actions">
              <a class="button" href="${escapeAttr(app.googlePlayUrl)}">${escapeHtml(page.googlePlay)}</a>
              ${appStoreButton}
            </div>
          </div>
          <div class="product-visual" aria-label="Hi Morse preview">
            <img class="hero-icon" src="${escapeAttr(app.icon)}" alt="Hi Morse app icon" width="192" height="192">
            <img class="feature-graphic" src="${escapeAttr(app.featureGraphic)}" alt="" width="1024" height="500">
          </div>
        </div>
      </section>
      <section class="section">
        <div class="shell split">
          <div>
            <h2>${escapeHtml(page.featuresHeading)}</h2>
            <ul class="list">${features}</ul>
          </div>
          <div>
            <h2>${escapeHtml(page.storeLinksHeading)}</h2>
            <div class="actions stacked">
              <a class="button" href="${escapeAttr(app.googlePlayUrl)}">${escapeHtml(page.googlePlay)}</a>
              ${appStoreButton}
              <a class="button secondary" href="/${fullSiteTag}/support/hi-morse/">${escapeHtml(page.supportLink)}</a>
              <a class="button secondary" href="/${fullSiteTag}/legal/hi-morse/privacy/">${escapeHtml(page.privacyLink)}</a>
            </div>
          </div>
        </div>
      </section>
      <section class="section muted-section">
        <div class="shell">
          <h2>${escapeHtml(page.screenshotsHeading)}</h2>
          <div class="screenshots">${screenshots}</div>
        </div>
      </section>`;
}

function renderSupportPage({ locale, content }) {
  const page = content.support;
  return `      <section class="hero compact">
        <div class="shell">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.headline)}</h1>
          <p class="lead">${escapeHtml(page.lead)}</p>
        </div>
      </section>
      <section class="section">
        <div class="shell">
          ${renderSections(page.sections)}
          <div class="actions">
            <a class="button" href="mailto:${escapeAttr(content.common.contactEmail)}">${escapeHtml(content.common.nav.contact)}</a>
            <a class="button secondary" href="/${locale.tag}/legal/hi-morse/privacy/">${escapeHtml(content.legal.privacyLabel)}</a>
          </div>
        </div>
      </section>`;
}

function renderLegalHub({ locale, content }) {
  const page = content.legal;
  return `      <section class="hero compact">
        <div class="shell">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.headline)}</h1>
          <p class="lead">${escapeHtml(page.lead)}</p>
        </div>
      </section>
      <section class="section">
        <div class="shell">
          <article class="app-card">
            <div>
              <h2>Hi Morse</h2>
              <p><a href="/${locale.tag}/legal/hi-morse/privacy/">${escapeHtml(page.privacyLabel)}</a></p>
            </div>
          </article>
        </div>
      </section>`;
}

function renderPrivacyPage({ content }) {
  const page = content.privacy;
  const metaItems = [
    page.effectiveDate
      ? `<div><dt>${escapeHtml(page.effectiveDateLabel ?? 'Effective date')}</dt><dd>${escapeHtml(page.effectiveDate)}</dd></div>`
      : '',
    page.lastUpdated
      ? `<div><dt>${escapeHtml(page.lastUpdatedLabel ?? 'Last updated')}</dt><dd>${escapeHtml(page.lastUpdated)}</dd></div>`
      : '',
  ].join('');
  const metaList = metaItems ? `<dl class="meta-list">
            ${metaItems}
          </dl>` : '';

  return `      <section class="hero compact">
        <div class="shell">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.headline)}</h1>
          <p class="lead">${escapeHtml(page.lead)}</p>
          ${metaList}
        </div>
      </section>
      <section class="section legal-body">
        <div class="shell">
          ${renderSections(page.sections)}
        </div>
      </section>`;
}

function renderSections(sections = []) {
  if (!sections.length) {
    return '';
  }

  return sections
    .map((section) => {
      const body = section.body.map(renderBodyItem).join('');

      return `<article class="content-section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${body}
          </article>`;
    })
    .join('');
}

function renderBodyItem(item) {
  if (Array.isArray(item)) {
    return `<ul class="list">${item.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>`;
  }

  if (typeof item === 'object' && item !== null) {
    if (item.type === 'links') {
      return `<ul class="list">${item.items
        .map((entry) => `<li><a href="${escapeAttr(entry.href)}">${escapeHtml(entry.label)}</a></li>`)
        .join('')}</ul>`;
    }

    if (item.type === 'faqs') {
      return `<div class="faq-list">${item.items
        .map(
          (entry) => `<article>
              <h3>${escapeHtml(entry.question)}</h3>
              <p>${escapeHtml(entry.answer)}</p>
            </article>`,
        )
        .join('')}</div>`;
    }
  }

  return `<p>${escapeHtml(item)}</p>`;
}

function renderLanguageDetectPage({ publishedLocales, fallbackLocale }) {
  const localeData = JSON.stringify(
    publishedLocales.map(({ tag }) => tag),
    null,
    2,
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BaTip</title>
    <meta name="description" content="BaTip apps, support, and legal documents.">
    <meta name="theme-color" content="#07130f">
    <link rel="canonical" href="${baseUrl}/">
${publishedLocales.map((locale) => `    <link rel="alternate" hreflang="${escapeAttr(locale.tag)}" href="${baseUrl}/${locale.tag}/">`).join('\n')}
    <link rel="alternate" hreflang="x-default" href="${baseUrl}/">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>
      const publishedLocales = ${localeData};
      const fallbackLocale = '${fallbackLocale}';
      const normalize = (tag) => String(tag || '').replace(/_/g, '-');
      const bestMatch = (languages) => {
        for (const language of languages) {
          const normalized = normalize(language);
          if (publishedLocales.includes(normalized)) return normalized;
          const base = normalized.split('-')[0];
          if (publishedLocales.includes(base)) return base;
        }
        return fallbackLocale;
      };
      const saved = localStorage.getItem('batip.locale');
      const target = bestMatch(saved ? [saved] : navigator.languages || [navigator.language]);
      location.replace('/' + target + '/');
    </script>
  </head>
  <body>
    <main class="fallback-page">
      <h1>BaTip</h1>
      <p><a href="/en/">Continue in English</a></p>
      <p><a href="/vi/">Tiếp tục bằng tiếng Việt</a></p>
    </main>
  </body>
</html>
`;
}

function renderAppLanguageDetectPage({ appLandingLocales, fallbackLocale }) {
  const localeData = JSON.stringify(
    appLandingLocales.map(({ tag }) => tag),
    null,
    2,
  );
  const aliases = JSON.stringify(
    {
      'en-au': 'en',
      'en-gb': 'en',
      'en-us': 'en',
      'zh-cn': 'zh-Hans',
      'zh-sg': 'zh-Hans',
      'zh-hans': 'zh-Hans',
      'zh-tw': 'zh-Hant',
      'zh-hk': 'zh-Hant',
      'zh-mo': 'zh-Hant',
      'zh-hant': 'zh-Hant',
    },
    null,
    2,
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Hi Morse | BaTip</title>
    <meta name="description" content="Hi Morse landing page with language detection.">
    <meta name="theme-color" content="#07130f">
    <link rel="canonical" href="${baseUrl}/apps/hi-morse/">
${appLandingLocales.map((locale) => `    <link rel="alternate" hreflang="${escapeAttr(locale.tag)}" href="${baseUrl}/${locale.tag}/apps/hi-morse/">`).join('\n')}
    <link rel="alternate" hreflang="x-default" href="${baseUrl}/en/apps/hi-morse/">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>
      const appLandingLocales = ${localeData};
      const localeAliases = ${aliases};
      const fallbackLocale = '${fallbackLocale}';
      const byLowercase = new Map(appLandingLocales.map((tag) => [tag.toLowerCase(), tag]));
      const normalize = (tag) => String(tag || '').replace(/_/g, '-');
      const bestMatch = (languages) => {
        for (const language of languages) {
          const normalized = normalize(language);
          const lower = normalized.toLowerCase();
          if (byLowercase.has(lower)) return byLowercase.get(lower);
          if (localeAliases[lower]) return localeAliases[lower];
          const base = lower.split('-')[0];
          if (byLowercase.has(base)) return byLowercase.get(base);
        }
        return fallbackLocale;
      };
      const saved = localStorage.getItem('batip.locale');
      const target = bestMatch(saved ? [saved] : navigator.languages || [navigator.language]);
      location.replace('/' + target + '/apps/hi-morse/');
    </script>
  </head>
  <body>
    <main class="fallback-page">
      <h1>Hi Morse</h1>
      <p><a href="/en/apps/hi-morse/">Continue in English</a></p>
      <p><a href="/vi/apps/hi-morse/">Tiếp tục bằng tiếng Việt</a></p>
    </main>
  </body>
</html>
`;
}

function renderSitemap() {
  const urls = ['/', '/apps/hi-morse/', ...publishedLocales.flatMap((locale) => [
    `/${locale.tag}/`,
    `/${locale.tag}/apps/hi-morse/`,
    `/${locale.tag}/support/hi-morse/`,
    `/${locale.tag}/legal/`,
    `/${locale.tag}/legal/hi-morse/privacy/`,
  ]), ...landingOnlyLocales.map((locale) => `/${locale.tag}/apps/hi-morse/`)];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${baseUrl}${url}</loc></url>`).join('\n')}
</urlset>
`;
}

function renderNotFoundPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page not found | BaTip</title>
    <meta name="description" content="The requested BaTip page could not be found.">
    <meta name="theme-color" content="#07130f">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="stylesheet" href="/assets/styles.css">
    <script>
      const pathParts = location.pathname.split('/').filter(Boolean);
      const locale = ['en', 'vi'].includes(pathParts[0]) ? pathParts[0] : 'en';
      document.documentElement.lang = locale;
    </script>
  </head>
  <body>
    <main class="fallback-page">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p><a class="button" href="/en/">Go to BaTip</a></p>
    </main>
  </body>
</html>
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function removeAppleDoubleFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.name.startsWith('._')) {
      rmSync(fullPath, { recursive: true, force: true });
      continue;
    }
    if (entry.isDirectory()) {
      removeAppleDoubleFiles(fullPath);
    }
  }
}

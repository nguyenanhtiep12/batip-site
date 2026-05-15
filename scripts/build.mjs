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

for (const locale of publishedLocales) {
  const content = readJson(`content/${locale.tag}/site.json`);
  const app = apps.find((entry) => entry.id === 'hi-morse');

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

writeFile('robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://batip.app/sitemap.xml\n');
writeFile('sitemap.xml', renderSitemap());
removeAppleDoubleFiles(distDir);

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function writePage({ locale, content, pageKey, urlPath, main }) {
  writeFile(
    path.join(urlPath.slice(1), 'index.html'),
    renderDocument({
      locale,
      content,
      pageKey,
      urlPath,
      main,
    }),
  );
}

function writeFile(relativePath, contents) {
  const absolutePath = path.join(distDir, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
}

function renderDocument({ locale, content, pageKey, urlPath, main }) {
  const page = content[pageKey];
  const canonical = `${baseUrl}${urlPath}`;
  const alternateLinks = renderAlternateLinks(urlPath);

  return `<!doctype html>
<html lang="${escapeAttr(locale.tag)}" dir="${escapeAttr(locale.dir)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(page.title)} | BaTip</title>
    <meta name="description" content="${escapeAttr(page.description)}">
    <link rel="canonical" href="${canonical}">
${alternateLinks}
    <link rel="icon" href="/assets/favicon.png">
    <link rel="stylesheet" href="/assets/styles.css">
    <script defer src="/assets/site.js"></script>
  </head>
  <body data-locale="${escapeAttr(locale.tag)}">
    <header class="site-header">
      <nav class="shell nav" aria-label="Primary">
        <a class="brand" href="/${locale.tag}/" aria-label="BaTip home">BaTip</a>
        <div class="nav-links">
          <a href="/${locale.tag}/apps/hi-morse/">${escapeHtml(content.common.nav.apps)}</a>
          <a href="/${locale.tag}/support/hi-morse/">${escapeHtml(content.common.nav.support)}</a>
          <a href="/${locale.tag}/legal/">${escapeHtml(content.common.nav.legal)}</a>
          <a href="mailto:${escapeAttr(content.common.contactEmail)}">${escapeHtml(content.common.nav.contact)}</a>
        </div>
        ${renderLanguageSwitcher({ locale, content, urlPath })}
      </nav>
    </header>
    <main>
${main}
    </main>
    <footer class="footer">
      <div class="shell footer-grid">
        <p>${escapeHtml(content.common.footer)}</p>
        <div class="footer-links">
          <a href="/${locale.tag}/support/hi-morse/">${escapeHtml(content.common.nav.support)}</a>
          <a href="/${locale.tag}/legal/">${escapeHtml(content.common.nav.legal)}</a>
          <a href="mailto:${escapeAttr(content.common.contactEmail)}">${escapeHtml(content.common.contactEmail)}</a>
        </div>
      </div>
    </footer>
  </body>
</html>
`;
}

function renderAlternateLinks(urlPath) {
  const currentTag = urlPath.split('/').filter(Boolean)[0];
  const suffix = urlPath.replace(`/${currentTag}/`, '/');
  const links = publishedLocales.map((locale) => {
    const href = `${baseUrl}/${locale.tag}${suffix}`;
    return `    <link rel="alternate" hreflang="${escapeAttr(locale.tag)}" href="${href}">`;
  });
  links.push(`    <link rel="alternate" hreflang="x-default" href="${baseUrl}/en${suffix}">`);
  return links.join('\n');
}

function renderLanguageSwitcher({ locale, content, urlPath }) {
  const options = publishedLocales
    .map((entry) => {
      const selected = entry.tag === locale.tag ? ' selected' : '';
      return `<option value="${escapeAttr(entry.tag)}"${selected}>${escapeHtml(entry.nativeName)}</option>`;
    })
    .join('');

  return `<label class="language-switcher">
          <span>${escapeHtml(content.common.language)}</span>
          <select data-language-switcher data-current-path="${escapeAttr(urlPath)}">
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
          <img class="hero-icon" src="${escapeAttr(app.icon)}" alt="Hi Morse app icon" width="192" height="192">
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
  const features = page.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('');
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
              <span class="button disabled" aria-disabled="true">${escapeHtml(page.appStoreComing)}</span>
            </div>
          </div>
          <img class="hero-icon" src="${escapeAttr(app.icon)}" alt="Hi Morse app icon" width="192" height="192">
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
              <a class="button secondary" href="/${locale.tag}/support/hi-morse/">${escapeHtml(page.supportLink)}</a>
              <a class="button secondary" href="/${locale.tag}/legal/hi-morse/privacy/">${escapeHtml(page.privacyLink)}</a>
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
  return `      <section class="hero compact">
        <div class="shell">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.headline)}</h1>
          <p class="lead">${escapeHtml(page.lead)}</p>
          <dl class="meta-list">
            <div><dt>Effective date</dt><dd>${escapeHtml(page.effectiveDate)}</dd></div>
            <div><dt>Last updated</dt><dd>${escapeHtml(page.lastUpdated)}</dd></div>
          </dl>
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
      const body = section.body
        .map((item) => {
          if (Array.isArray(item)) {
            return `<ul class="list">${item.map((entry) => `<li>${escapeHtml(entry)}</li>`).join('')}</ul>`;
          }
          return `<p>${escapeHtml(item)}</p>`;
        })
        .join('');

      return `<article class="content-section">
            <h2>${escapeHtml(section.heading)}</h2>
            ${body}
          </article>`;
    })
    .join('');
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
    <link rel="canonical" href="${baseUrl}/">
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

function renderSitemap() {
  const urls = ['/', ...publishedLocales.flatMap((locale) => [
    `/${locale.tag}/`,
    `/${locale.tag}/apps/hi-morse/`,
    `/${locale.tag}/support/hi-morse/`,
    `/${locale.tag}/legal/`,
    `/${locale.tag}/legal/hi-morse/privacy/`,
  ])];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${baseUrl}${url}</loc></url>`).join('\n')}
</urlset>
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

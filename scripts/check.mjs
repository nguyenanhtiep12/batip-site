import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const locales = readJson('src/data/locales.json');
const apps = readJson('src/data/apps.json');
const publishedLocales = locales.filter((locale) => locale.published);
const appLandingLocales = locales.filter((locale) => locale.published || locale.storeLanding);
const landingOnlyLocales = appLandingLocales.filter((locale) => !locale.published);
const requiredPublishedContentKeys = ['common', 'home', 'app', 'support', 'legal', 'privacy', 'alts'];

const requiredFiles = [
  'index.html',
  'apps/hi-morse/index.html',
  'support/hi-morse/index.html',
  ...publishedLocales.flatMap((locale) => [
    `${locale.tag}/index.html`,
    `${locale.tag}/apps/hi-morse/index.html`,
    `${locale.tag}/support/hi-morse/index.html`,
    `${locale.tag}/legal/index.html`,
    `${locale.tag}/legal/hi-morse/privacy/index.html`,
  ]),
  ...landingOnlyLocales.map((locale) => `${locale.tag}/apps/hi-morse/index.html`),
  'assets/styles.css',
  'assets/site.js',
  'assets/hi-morse/icon-1024.png',
  'assets/hi-morse/feature-graphic-1024x500.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'site.webmanifest',
  '404.html',
  'sitemap.xml',
  'robots.txt',
];

let failures = 0;

for (const locale of appLandingLocales) {
  const contentTag = locale.contentFallback ?? locale.tag;
  const contentPath = path.join(root, 'content', contentTag, 'site.json');

  if (!existsSync(contentPath)) {
    console.error(`Missing content/${contentTag}/site.json for ${locale.tag}`);
    failures++;
  }

  if (locale.storeLanding && !locale.published && locale.contentFallback) {
    console.error(`${locale.tag} store landing must use localized content, not contentFallback`);
    failures++;
  }

  if (locale.published && existsSync(contentPath)) {
    const content = JSON.parse(readFileSync(contentPath, 'utf8'));
    for (const key of requiredPublishedContentKeys) {
      if (!content[key]) {
        console.error(`${locale.tag} published locale missing content.${key}`);
        failures++;
      }
    }

    if (!content.privacy?.sections?.length) {
      console.error(`${locale.tag} published locale missing privacy sections`);
      failures++;
    }
  }
}

for (const file of requiredFiles) {
  const fullPath = path.join(dist, file);
  if (!existsSync(fullPath)) {
    console.error(`Missing ${file}`);
    failures++;
  }
}

for (const file of requiredFiles.filter((entry) => entry.endsWith('.html'))) {
  const fullPath = path.join(dist, file);
  if (!existsSync(fullPath)) continue;
  const html = readFileSync(fullPath, 'utf8');
  const requiredNeedles = ['<title>', 'href="/assets/styles.css"', 'rel="icon"', 'rel="apple-touch-icon"'];
  if (file !== '404.html') {
    requiredNeedles.push('rel="canonical"', 'rel="alternate"');
  }

  for (const needle of requiredNeedles) {
    if (!html.includes(needle)) {
      console.error(`${file} missing ${needle}`);
      failures++;
    }
  }

  for (const href of html.matchAll(/href="([^"]+)"/g)) {
    const target = href[1];
    if (!target.startsWith('/') || target.startsWith('//')) continue;
    if (!internalTargetExists(target)) {
      console.error(`${file} links to missing ${target}`);
      failures++;
    }
  }

  for (const src of html.matchAll(/src="([^"]+)"/g)) {
    const target = src[1];
    if (!target.startsWith('/') || target.startsWith('//')) continue;
    if (!internalTargetExists(target)) {
      console.error(`${file} references missing ${target}`);
      failures++;
    }
  }
}

const distFiles = listFiles(dist);

for (const file of distFiles) {
  if (path.basename(file).startsWith('._')) {
    console.error(`Unexpected AppleDouble file in dist: ${path.relative(dist, file)}`);
    failures++;
  }
}

for (const app of apps) {
  if (app.googlePlayStatus === 'closedTesting' && app.googlePlayUrl && !app.googlePlayTesterUrl) {
    for (const file of distFiles.filter((entry) => entry.endsWith('.html'))) {
      const html = readFileSync(file, 'utf8');
      if (html.includes(app.googlePlayUrl)) {
        console.error(`${path.relative(dist, file)} exposes closed-testing Google Play URL`);
        failures++;
      }
    }
  }
}

for (const file of listFiles(path.join(root, 'content'))) {
  if (path.basename(file).startsWith('._')) {
    console.error(`Unexpected AppleDouble file in content: ${path.relative(root, file)}`);
    failures++;
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log('Site checks passed.');
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return listFiles(fullPath);
    }
    return fullPath;
  });
}

function internalTargetExists(target) {
  const cleanTarget = target.split('#')[0].split('?')[0];
  if (cleanTarget === '/') {
    return existsSync(path.join(dist, 'index.html'));
  }

  const relative = cleanTarget.replace(/^\/+/, '');
  const direct = path.join(dist, relative);
  if (existsSync(direct)) return true;

  const index = path.join(dist, relative, 'index.html');
  return existsSync(index);
}

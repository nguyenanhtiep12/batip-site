import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const requiredFiles = [
  'index.html',
  'en/index.html',
  'en/apps/hi-morse/index.html',
  'en/support/hi-morse/index.html',
  'en/legal/index.html',
  'en/legal/hi-morse/privacy/index.html',
  'vi/index.html',
  'vi/apps/hi-morse/index.html',
  'vi/support/hi-morse/index.html',
  'vi/legal/index.html',
  'vi/legal/hi-morse/privacy/index.html',
  'assets/styles.css',
  'assets/site.js',
  'assets/hi-morse/icon-1024.png',
  'assets/hi-morse/feature-graphic-1024x500.png',
  'sitemap.xml',
  'robots.txt',
];

let failures = 0;

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
  for (const needle of ['<title>', 'rel="canonical"', 'href="/assets/styles.css"']) {
    if (!html.includes(needle)) {
      console.error(`${file} missing ${needle}`);
      failures++;
    }
  }
}

for (const file of listFiles(dist)) {
  if (path.basename(file).startsWith('._')) {
    console.error(`Unexpected AppleDouble file in dist: ${path.relative(dist, file)}`);
    failures++;
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log('Site checks passed.');
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

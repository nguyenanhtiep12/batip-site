import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const flutterBaseHref = process.env.HI_MORSE_WEB_BASE_HREF ?? '/apps/hi-morse/web/';
const hiMorseSource = resolveHiMorseSource();
const flutterBuildOutput = path.join(hiMorseSource, 'build', 'web');
const siteWebOutput = path.join(root, 'dist', 'apps', 'hi-morse', 'web');

validateBaseHref(flutterBaseHref);

run('flutter', ['pub', 'get'], hiMorseSource);
run('flutter', ['build', 'web', '--release', '--base-href', flutterBaseHref], hiMorseSource);

rmSync(siteWebOutput, { recursive: true, force: true });
mkdirSync(path.dirname(siteWebOutput), { recursive: true });
cpSync(flutterBuildOutput, siteWebOutput, { recursive: true });
removeAppleDoubleFiles(path.join(root, 'dist', 'apps', 'hi-morse'));

console.log(`Copied Hi Morse web build to ${path.relative(root, siteWebOutput)}`);

function resolveHiMorseSource() {
  const candidates = [
    process.env.HI_MORSE_SOURCE,
    path.resolve(root, '..', 'Learn-Morse', 'learn_morse'),
    path.resolve(root, '..', 'Learn-Morse'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (existsSync(path.join(resolved, 'pubspec.yaml'))) {
      return resolved;
    }

    const nested = path.join(resolved, 'learn_morse');
    if (existsSync(path.join(nested, 'pubspec.yaml'))) {
      return nested;
    }
  }

  throw new Error(
    'Could not find the Hi Morse Flutter project. Set HI_MORSE_SOURCE to the learn_morse directory.',
  );
}

function validateBaseHref(baseHref) {
  if (!baseHref.startsWith('/') || !baseHref.endsWith('/')) {
    throw new Error(`HI_MORSE_WEB_BASE_HREF must start and end with "/"; received "${baseHref}".`);
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function removeAppleDoubleFiles(directory) {
  if (!existsSync(directory)) return;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.name.startsWith('._')) {
      rmSync(fullPath, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removeAppleDoubleFiles(fullPath);
    }
  }
}

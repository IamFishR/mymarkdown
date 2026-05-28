#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'src/lib/version.ts');

const src = readFileSync(file, 'utf8');
const match = src.match(/APP_VERSION = '(\d+)\.(\d+)\.(\d+)'/);
if (!match) {
  console.error('APP_VERSION not found in', file);
  process.exit(1);
}

const [, major, minor, patch] = match;
const current = `${major}.${minor}.${patch}`;
const next = `${major}.${minor}.${Number(patch) + 1}`;

writeFileSync(file, src.replace(match[0], `APP_VERSION = '${next}'`));
execSync(`git add "${file}"`, { cwd: root, stdio: 'inherit' });

console.log(`bumped APP_VERSION: ${current} -> ${next}`);

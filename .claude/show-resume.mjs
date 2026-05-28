#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(here, 'PROGRESS.md');

const src = readFileSync(file, 'utf8');

function section(heading, linesAfter) {
  const re = new RegExp(`^##\\s+${heading}\\s*$`, 'm');
  const m = src.match(re);
  if (!m) return '';
  const start = m.index + m[0].length;
  const rest = src.slice(start).split(/\r?\n/);
  return rest.slice(0, linesAfter + 1).join('\n').trimEnd();
}

console.log('=== Where you left off ===');
console.log('## Current Focus' + section('Current Focus', 2));
console.log('');
console.log('## Resume Here' + section('Resume Here', 4));

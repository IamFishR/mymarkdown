#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(here, 'PROGRESS.md');

const today = new Date().toISOString().slice(0, 10);
const src = readFileSync(file, 'utf8');
const next = src.replace(/Last updated: .*/m, `Last updated: ${today}`);

if (next !== src) writeFileSync(file, next);

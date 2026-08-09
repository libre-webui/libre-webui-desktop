/*
 * Libre WebUI Desktop
 * Copyright (C) 2025 Kroonen AI, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at:
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Fetches the pinned libre-webui release, builds the frontend in Electron
 * mode (relative asset paths so file:// loading works), and stages the
 * pieces electron-builder bundles as extra resources:
 *
 *   app/frontend/dist  <- ELECTRON_BUILD=true frontend build
 *   app/plugins        <- bundled provider plugin manifests
 *
 * The pin lives in package.json under "librewebui". A cached checkout at
 * the right tag is reused, so repeat builds skip the clone.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
const pin = pkg.librewebui;
if (!pin?.repository || !pin?.tag) {
  console.error('package.json needs "librewebui": { repository, tag }');
  process.exit(1);
}

const checkout = path.join(root, '.app-src');
const stage = path.join(root, 'app');

// Windows resolves npm through cmd.exe (npm.cmd), which execFileSync only
// finds with a shell. The arguments here are all our own constants.
const shell = process.platform === 'win32';
const run = (command, args, options = {}) =>
  execFileSync(command, args, { stdio: 'inherit', shell, ...options });

const checkoutTag = () => {
  try {
    return execFileSync('git', ['-C', checkout, 'describe', '--tags'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
};

if (checkoutTag() !== pin.tag) {
  fs.rmSync(checkout, { recursive: true, force: true });
  console.log(`Cloning ${pin.repository} at ${pin.tag}…`);
  run('git', [
    'clone',
    '--depth',
    '1',
    '--branch',
    pin.tag,
    pin.repository,
    checkout,
  ]);
} else {
  console.log(`Reusing cached checkout at ${pin.tag}.`);
}

console.log('Installing frontend dependencies…');
run('npm', ['install', '--workspace=frontend', '--no-audit', '--no-fund'], {
  cwd: checkout,
});

console.log('Building the frontend for Electron…');
run('npm', ['run', 'build', '--workspace=frontend'], {
  cwd: checkout,
  env: { ...process.env, ELECTRON_BUILD: 'true' },
});

fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(path.join(stage, 'frontend'), { recursive: true });
fs.cpSync(
  path.join(checkout, 'frontend', 'dist'),
  path.join(stage, 'frontend', 'dist'),
  { recursive: true }
);
fs.mkdirSync(path.join(stage, 'plugins'), { recursive: true });
for (const entry of fs.readdirSync(path.join(checkout, 'plugins'))) {
  if (entry.endsWith('.json')) {
    fs.copyFileSync(
      path.join(checkout, 'plugins', entry),
      path.join(stage, 'plugins', entry)
    );
  }
}

console.log(`Staged ${pin.tag} into app/. Ready for electron-builder.`);

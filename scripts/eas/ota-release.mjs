#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const allowedChannels = new Set(['development', 'preview', 'production']);

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });
}

function runCapture(command, args) {
  return spawnSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

function hasCommand(command) {
  const result = runCapture(command, ['--version']);
  return result.status === 0;
}

function parseArgs(argv) {
  let channel = null;
  let message = null;
  let allowDirty = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg) continue;

    if (arg === '--allow-dirty') {
      allowDirty = true;
      continue;
    }

    if (arg === '--message' || arg === '-m') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('Falta el valor de --message.');
      }
      message = value;
      i += 1;
      continue;
    }

    if (arg.startsWith('--message=')) {
      message = arg.slice('--message='.length);
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Opcion no soportada: ${arg}`);
    }

    if (!channel) {
      channel = arg;
      continue;
    }

    message = message ? `${message} ${arg}` : arg;
  }

  return { channel, message, allowDirty };
}

function ensureGitClean(allowDirty) {
  const insideRepo = runCapture('git', ['rev-parse', '--is-inside-work-tree']);
  if (insideRepo.status !== 0) {
    return;
  }

  if (allowDirty) {
    return;
  }

  const status = runCapture('git', ['status', '--porcelain']);
  if (status.status !== 0) {
    throw new Error('No se pudo verificar el estado de git.');
  }

  if (status.stdout.trim().length > 0) {
    throw new Error(
      'El repositorio tiene cambios sin commit. Usa --allow-dirty si quieres publicar de todas formas.'
    );
  }
}

function resolveMessage(inputMessage) {
  if (inputMessage && inputMessage.trim().length > 0) {
    return inputMessage.trim();
  }

  const sha = runCapture('git', ['rev-parse', '--short', 'HEAD']);
  const shortSha = sha.status === 0 ? sha.stdout.trim() : 'no-sha';
  const now = new Date().toISOString();
  return `OTA update ${now} (${shortSha})`;
}

function mapAppEnv(channel) {
  if (channel === 'production') return 'production';
  if (channel === 'preview') return 'preview';
  return 'development';
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  if (!args.channel) {
    console.error('\nUso: node ./scripts/eas/ota-release.mjs <channel> --message "texto" [--allow-dirty]');
    console.error('Canales permitidos: development, preview, production');
    process.exit(1);
  }

  if (!allowedChannels.has(args.channel)) {
    console.error(`\nCanal invalido: ${args.channel}`);
    console.error('Canales permitidos: development, preview, production');
    process.exit(1);
  }

  try {
    ensureGitClean(args.allowDirty);
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }

  const message = resolveMessage(args.message);
  const appEnv = mapAppEnv(args.channel);
  const env = { ...process.env, APP_ENV: appEnv };
  const updateArgs = ['update', '--channel', args.channel, '--message', message];

  console.log('\nPublicando OTA update con estos parametros:');
  console.log(`- channel: ${args.channel}`);
  console.log(`- APP_ENV: ${appEnv}`);
  console.log(`- message: ${message}`);

  const easInstalled = hasCommand('eas');
  const command = easInstalled ? 'eas' : 'pnpm';
  const commandArgs = easInstalled ? updateArgs : ['dlx', 'eas-cli@latest', ...updateArgs];

  const result = run(command, commandArgs, { env });
  process.exit(result.status ?? 1);
}

main();

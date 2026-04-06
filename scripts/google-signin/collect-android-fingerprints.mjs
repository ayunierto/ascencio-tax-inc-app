#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = process.cwd();

function run(command) {
  return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
}

function extractFingerprintBlock(rawOutput) {
  const lines = rawOutput.split(/\r?\n/);
  return lines
    .filter(
      (line) =>
        /Alias name:|SHA1:|SHA256:|Valid from:/.test(line) &&
        !/Signature algorithm/.test(line),
    )
    .map((line) => line.trim())
    .join('\n');
}

function printSection(title, block) {
  console.log(`\n=== ${title} ===`);
  console.log(block || 'No se pudo extraer la información.');
}

function resolveCredentials() {
  const credentialsPath = path.join(projectRoot, 'credentials.json');

  if (!fs.existsSync(credentialsPath)) {
    return null;
  }

  const data = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  const android = data?.android?.keystore;

  if (!android) {
    return null;
  }

  return {
    keystorePath: path.join(projectRoot, android.keystorePath),
    keystorePassword: android.keystorePassword,
    keyAlias: android.keyAlias,
    keyPassword: android.keyPassword,
  };
}

function collectDebugFingerprint() {
  const debugKeystorePath = path.join(
    projectRoot,
    'android/app/debug.keystore',
  );

  if (!fs.existsSync(debugKeystorePath)) {
    return 'No existe android/app/debug.keystore';
  }

  const cmd = [
    'keytool -list -v',
    `-keystore "${debugKeystorePath}"`,
    '-alias androiddebugkey',
    '-storepass android',
    '-keypass android',
  ].join(' ');

  return extractFingerprintBlock(run(cmd));
}

function collectReleaseFingerprint(credentials) {
  if (!credentials) {
    return 'No se encontró configuración de keystore Android en credentials.json';
  }

  if (!fs.existsSync(credentials.keystorePath)) {
    return `No existe el keystore: ${credentials.keystorePath}`;
  }

  const cmd = [
    'keytool -list -v',
    `-keystore "${credentials.keystorePath}"`,
    `-alias "${credentials.keyAlias}"`,
    `-storepass "${credentials.keystorePassword}"`,
    `-keypass "${credentials.keyPassword}"`,
  ].join(' ');

  return extractFingerprintBlock(run(cmd));
}

function main() {
  try {
    run('keytool -help');
  } catch {
    console.error(
      'No se encontró keytool. Instala un JDK y vuelve a ejecutar este script.',
    );
    process.exit(1);
  }

  const credentials = resolveCredentials();

  console.log('Project root:', projectRoot);
  console.log('Android package:', 'com.ayunierto.ascenciotaxinc');

  printSection('DEBUG (local)', collectDebugFingerprint());
  printSection(
    'RELEASE/UPLOAD (EAS credentials.json)',
    collectReleaseFingerprint(credentials),
  );

  console.log('\n=== PENDIENTE MANUAL (Google Play App Signing) ===');
  console.log(
    'Obtén la huella SHA-1 y SHA-256 de App Signing en Google Play Console > Setup > App integrity > App signing key certificate.',
  );
}

main();

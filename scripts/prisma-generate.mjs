#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const prismaClientDir = path.join(workspaceRoot, 'node_modules', '.prisma', 'client');
const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const forwardedArgs = args.filter((argument) => argument !== '--strict');

function ensureOfflineStub() {
  if (existsSync(path.join(prismaClientDir, 'index.js'))) {
    return;
  }
  mkdirSync(prismaClientDir, { recursive: true });
  const stubMessage = `"use strict";\nthrow new Error("Prisma Client не сгенерирован. Подключите интернет и запустите 'pnpm prisma:generate --strict'.");\n`;
  writeFileSync(path.join(prismaClientDir, 'index.js'), stubMessage, 'utf8');
  writeFileSync(
    path.join(prismaClientDir, 'index.d.ts'),
    'export declare class PrismaClient { constructor(): never; }\n',
    'utf8'
  );
}

async function run() {
  const env = {
    ...process.env,
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING ?? '1'
  };

  if (strictMode) {
    env.PRISMA_GENERATE_STRICT = env.PRISMA_GENERATE_STRICT ?? '1';
  }

  await new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', '@aidvokat/api', 'exec', 'prisma', 'generate', ...forwardedArgs], {
      cwd: workspaceRoot,
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      if (strictMode || process.env.PRISMA_GENERATE_STRICT) {
        reject(new Error(`Prisma generate exited with code ${code}`));
        return;
      }

      ensureOfflineStub();
      console.warn(
        '\n⚠️  Prisma Client не удалось сгенерировать (видимо, недоступны бинарники). ' +
          'Мы создали заглушку, чтобы команда не падала. ' +
          "Когда появится доступ к интернету, выполните 'pnpm prisma:generate --strict' для настоящей генерации.\n"
      );
      resolve();
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

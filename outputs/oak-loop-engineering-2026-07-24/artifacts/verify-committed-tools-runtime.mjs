import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const target = path.resolve(process.argv[2] ?? process.cwd());
const packages = [
  ['loop-audit', 'test/auditor.test.mjs'],
  ['loop-init', 'test/cli.test.mjs'],
  ['loop-cost', 'test/estimator.test.mjs'],
];

const started = performance.now();
let tests = 0;
const packageResults = [];

for (const [name, testFile] of packages) {
  const cwd = path.join(target, 'tools', name);
  const result = spawnSync(
    process.execPath,
    ['--test', testFile],
    { cwd, encoding: 'utf8', windowsHide: true },
  );
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');

  const count = Number((result.stdout ?? '').match(/tests\s+(\d+)/)?.[1] ?? 0);
  tests += count;
  packageResults.push({
    package: name,
    exitCode: result.status,
    tests: count,
    nodeModulesPresent: existsSync(path.join(cwd, 'node_modules')),
  });
  if (result.status !== 0) {
    process.exitCode = 1;
  }
}

const git = spawnSync(
  'git',
  ['-c', `safe.directory=${target}`, '-C', target, 'status', '--porcelain=v1'],
  { encoding: 'utf8', windowsHide: true },
);
if (git.status !== 0) {
  process.stderr.write(git.stderr ?? '');
  process.exitCode = 1;
}

const statusEntries = (git.stdout ?? '').split(/\r?\n/).filter(Boolean);
if (statusEntries.length !== 0) {
  process.stderr.write(`${statusEntries.join('\n')}\n`);
  process.exitCode = 1;
}

const summary = {
  target,
  packages: packageResults,
  tests,
  elapsedSeconds: Number(((performance.now() - started) / 1000).toFixed(3)),
  statusEntries: statusEntries.length,
  pass: process.exitCode !== 1 && tests === 24,
};

if (tests !== 24) {
  summary.pass = false;
  process.exitCode = 1;
}

process.stdout.write(`${JSON.stringify(summary)}\n`);

// Fails when any file in src/ uses a name that does not exist.
//
// Vite never type-checks and tsconfig has checkJs off, so a leftover
// variable in a .jsx file (RoomHub's `ronkiIsLoop`, 25 Sep 2026; the
// day-transition bug `prev.minigameStaminaMax`, 22 Apr 2026) only shows
// up as a crash in the browser. This runs tsc with checkJs on and keeps
// only "Cannot find name" errors (TS2304, TS2552), ignoring the ~1,900
// type complaints that checkJs raises on untyped JavaScript.
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json', '--checkJs'], {
  encoding: 'utf8',
  shell: true,
});
const hits = `${r.stdout}\n${r.stderr}`
  .split(/\r?\n/)
  .filter((l) => /error TS(2304|2552)/.test(l))
  .filter((l) => !/\.test\.(j|t)sx?\(/.test(l));

if (hits.length) {
  console.error(`Undefined names (${hits.length}):\n${hits.join('\n')}`);
  process.exit(1);
}
console.log('check-names: no undefined names in src/');

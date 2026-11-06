#!/usr/bin/env node
// Deterministic stand-in for an agent CLI, used by tests and local demos.
// Usage: node fake-agent.mjs [--session <id>] [--delay <ms>]   (prompt on stdin)
// Prompt keywords: "fail" -> exit 1, "sleep" -> run ~60s (for cancel tests).
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const argv = process.argv.slice(2);
const opt = (k) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : undefined;
};
const delay = Number(opt('--delay') ?? 5);
const session = opt('--session') ?? randomUUID();
const stateFile = join(tmpdir(), `nado-fake-${session}.json`);
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : { turns: 0 };
state.turns += 1;
writeFileSync(stateFile, JSON.stringify(state));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');

let prompt = '';
process.stdin.setEncoding('utf8');
for await (const c of process.stdin) prompt += c;
prompt = prompt.trim();

out({ type: 'start', session, cwd: process.cwd() });
if (prompt.includes('fail')) {
  process.stderr.write('fake failure requested\n');
  process.exit(1);
}
if (prompt.includes('sleep')) {
  for (let i = 0; i < 600; i++) {
    out({ type: 'delta', text: '.' });
    await sleep(100);
  }
}
out({ type: 'tool', id: 't1', name: 'echo', input: { prompt } });
out({ type: 'tool_result', id: 't1', output: prompt.toUpperCase() });
const reply = `turn ${state.turns}: you said "${prompt}"`;
for (const w of reply.split(/(?<= )/)) {
  out({ type: 'delta', text: w });
  await sleep(delay);
}
out({ type: 'message', text: reply });
out({ type: 'end', session, usage: { input: prompt.length, output: reply.length } });

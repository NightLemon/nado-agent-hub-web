#!/usr/bin/env node
// Offline operational helper: never overwrites a source or an existing target.
import { DatabaseSync } from 'node:sqlite';
import { closeSync, existsSync, openSync, realpathSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

const VERSIONS = { hub: 7, runner: 3, openclaw: 1 };
const TABLES = { hub: ['machines', 'sessions', 'turns', 'events'], runner: ['runs', 'outbox', 'imports'], openclaw: ['cursors', 'pending', 'seen', 'metadata'] };
const quote = (name) => `"${name.replaceAll('"', '""')}"`;

function inspect(db, kind) {
  const version = Number(db.prepare('PRAGMA user_version').get().user_version);
  if (version > VERSIONS[kind]) throw new Error(`unknown newer ${kind} schema ${version}; supported <= ${VERSIONS[kind]}`);
  const integrity = db.prepare('PRAGMA integrity_check').all();
  if (integrity.length !== 1 || integrity[0].integrity_check !== 'ok') throw new Error('SQLite integrity check failed');
  if (db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('SQLite foreign key check failed');
  const tables = db.prepare("SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
  for (const table of TABLES[kind]) {
    if (!tables.some((row) => row.name === table)) throw new Error(`not a recognized ${kind} database: missing ${table}`);
  }
  const hash = createHash('sha256');
  hash.update(JSON.stringify({ version, tables }));
  const counts = {};
  for (const { name } of tables) {
    counts[name] = Number(db.prepare(`SELECT count(*) AS n FROM ${quote(name)}`).get().n);
    // Canonical row ordering includes every column, so VACUUM/repacked rowids do not affect verification.
    const columns = db.prepare(`PRAGMA table_info(${quote(name)})`).all().map((row) => quote(row.name));
    const stmt = db.prepare(`SELECT * FROM ${quote(name)} ORDER BY ${columns.join(',')}`);
    stmt.setReadBigInts(true);
    for (const row of stmt.iterate()) {
      hash.update(JSON.stringify(row, (_key, value) => typeof value === 'bigint' ? { integer: value.toString() }
        : value instanceof Uint8Array ? { bytes: Buffer.from(value).toString('base64') } : value));
      hash.update('\n');
    }
  }
  return { kind, schemaVersion: version, integrity: 'ok', counts, contentHash: hash.digest('hex') };
}

function main() {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: {
    db: { type: 'string' }, to: { type: 'string' }, kind: { type: 'string' },
  } });
  const [command] = positionals;
  if (!['inspect', 'backup', 'restore-copy'].includes(command) || !values.db || !Object.hasOwn(VERSIONS, values.kind ?? '')) {
    throw new Error('usage: node scripts/storage.mjs <inspect|backup|restore-copy> --kind <hub|runner|openclaw> --db <existing-file> [--to <new-file>]');
  }
  const source = realpathSync(resolve(values.db));
  if (!statSync(source).isFile()) throw new Error('--db must be an existing regular file');
  const db = new DatabaseSync(source, { readOnly: true });
  try {
    // Keep source inspection and VACUUM in separate reads: VACUUM provides its own consistent snapshot.
    const before = inspect(db, values.kind);
    if (command === 'inspect') return { command, ...before };
    if (!values.to) throw new Error('--to is required and must not already exist');
    const target = resolve(values.to);
    if (target === source || existsSync(target)) throw new Error('refusing to overwrite an existing target');
    closeSync(openSync(target, 'wx', 0o600));
    db.prepare('VACUUM INTO ?').run(target);
    const copied = new DatabaseSync(target, { readOnly: true });
    try {
      const after = inspect(copied, values.kind);
      // A live writer could change data between reads. Require offline/quiescent source for full equality.
      const now = inspect(db, values.kind);
      if (before.contentHash !== after.contentHash || after.contentHash !== now.contentHash) {
        throw new Error('source changed during backup or copied content differs; target retained for diagnosis, retry with source stopped');
      }
      return { command, ...after, verified: true, target };
    } finally { copied.close(); }
  } finally { db.close(); }
}

try { console.log(JSON.stringify(main())); }
catch (error) { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; }

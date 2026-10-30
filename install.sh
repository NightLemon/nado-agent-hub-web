#!/bin/sh
# Runner installer for Linux/macOS. Verify every artifact before stopping only this install's service.
# Pipe use: curl -fsSL https://<pages>/install.sh | NADO_HUB=https://hub.example.com NADO_TOKEN=nado_m_... sh
# Local verification: sh install.sh --dry-run --install-dir "$(mktemp -d)"
set -eu

DRY_RUN="${NADO_DRY_RUN:-}"
INSTALL_DIR="${NADO_INSTALL_DIR:-}"
while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --install-dir) shift; [ "$#" -gt 0 ] || { echo '--install-dir needs a path' >&2; exit 2; }; INSTALL_DIR=$1 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

BASE="${NADO_DOWNLOAD_BASE:-https://nightlemon.github.io/nado-agent-hub-web}"
BASE="${BASE%/}"
case "$BASE" in
  https://*) ;;
  http://*) [ "${NADO_ALLOW_INSECURE_DOWNLOAD:-}" = 1 ] || { echo 'NADO_DOWNLOAD_BASE must use HTTPS (set NADO_ALLOW_INSECURE_DOWNLOAD=1 only for a local test server)' >&2; exit 1; } ;;
  *) echo 'NADO_DOWNLOAD_BASE must be an HTTP(S) URL' >&2; exit 1 ;;
esac
DIR="${INSTALL_DIR:-$HOME/.nado-runner}"
OS="$(uname -s)"
UNIT="$HOME/.config/systemd/user/nado-runner.service"
PLIST="$HOME/Library/LaunchAgents/dev.nado.runner.plist"
STATE="$DIR/install-state.json"
NODE="$(command -v node || true)"
[ -n "$NODE" ] || { echo 'Node.js 22.16+ LTS or 24+ is required (https://nodejs.org or your package manager)' >&2; exit 1; }
"$NODE" -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>=24||(a===22&&b>=16)?0:1)' ||
  { echo "Node.js 22.16+ LTS or 24+ is required, found $($NODE --version)" >&2; exit 1; }

is_our_file() {
  [ -f "$1" ] && grep -F "$DIR/lib/nado-runner.mjs" "$1" >/dev/null 2>&1
}

stop_own_service() {
  if [ "$OS" = Darwin ] && is_our_file "$PLIST"; then
    launchctl unload "$PLIST" 2>/dev/null || true
  elif is_our_file "$UNIT" && command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then
    systemctl --user stop nado-runner 2>/dev/null || true
  fi
  # Do not use pkill: only the registered service is in scope, never unrelated Node processes.
}

remove_own_service() {
  if [ "$OS" = Darwin ] && is_our_file "$PLIST"; then
    launchctl unload "$PLIST" 2>/dev/null || true
    rm -f "$PLIST"
  elif is_our_file "$UNIT"; then
    if command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then
      systemctl --user disable --now nado-runner 2>/dev/null || true
      systemctl --user daemon-reload 2>/dev/null || true
    fi
    rm -f "$UNIT"
  fi
}

if [ -n "${NADO_UNINSTALL:-}" ]; then
  remove_own_service
  echo "Runner service removed. Config and durable outbox are left in $DIR."
  exit 0
fi

STAGE="$(mktemp -d "${TMPDIR:-/tmp}/nado-runner-download.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT HUP INT TERM
curl -fsSL "$BASE/runner/manifest.json" -o "$STAGE/manifest.json"
for artifact in nado-runner.mjs nado-supervisor.mjs nado-storage.mjs fake-agent.mjs; do
  curl -fsSL "$BASE/runner/$artifact" -o "$STAGE/$artifact"
done
MANIFEST="$STAGE/manifest.json" STAGE="$STAGE" "$NODE" <<'NODE'
const fs = require('fs'), crypto = require('crypto'), path = require('path');
const manifest = JSON.parse(fs.readFileSync(process.env.MANIFEST, 'utf8'));
const expected = new Set(['nado-runner.mjs', 'nado-supervisor.mjs', 'nado-storage.mjs', 'fake-agent.mjs']);
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.artifacts) || manifest.artifacts.length !== expected.size) throw new Error('manifest does not describe the required artifact set');
for (const item of manifest.artifacts) {
  if (!expected.delete(item.name) || !/^[a-f0-9]{64}$/.test(item.sha256)) throw new Error(`invalid manifest entry: ${item.name}`);
  const file = path.join(process.env.STAGE, item.name);
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (actual !== item.sha256) throw new Error(`SHA-256 mismatch for ${item.name}`);
}
if (expected.size) throw new Error('manifest omits required artifacts');
console.log(`Validated runner artifact set version ${manifest.version}`);
NODE

if [ -n "$DRY_RUN" ]; then
  echo "Dry run: would install into $DIR and restart only its registered service."
  exit 0
fi

if [ ! -f "$DIR/config.json" ] && { [ -z "${NADO_HUB:-}" ] || [ -z "${NADO_TOKEN:-}" ]; }; then
  echo 'NADO_HUB and NADO_TOKEN are required for a first install' >&2
  exit 2
fi
mkdir -p "$DIR/lib" "$DIR/bin"
# All downloads and hashes were verified before this point; config.json and durable outbox are never replaced.
stop_own_service
install -m 700 "$STAGE/nado-runner.mjs" "$DIR/lib/.nado-runner.mjs.new"
install -m 700 "$STAGE/nado-supervisor.mjs" "$DIR/lib/.nado-supervisor.mjs.new"
install -m 700 "$STAGE/nado-storage.mjs" "$DIR/lib/.nado-storage.mjs.new"
install -m 700 "$STAGE/fake-agent.mjs" "$DIR/bin/.fake-agent.mjs.new"
mv -f "$DIR/lib/.nado-runner.mjs.new" "$DIR/lib/nado-runner.mjs"
mv -f "$DIR/lib/.nado-supervisor.mjs.new" "$DIR/lib/nado-supervisor.mjs"
mv -f "$DIR/lib/.nado-storage.mjs.new" "$DIR/lib/nado-storage.mjs"
mv -f "$DIR/bin/.fake-agent.mjs.new" "$DIR/bin/fake-agent.mjs"

if [ ! -f "$DIR/config.json" ]; then
  NADO_RUNNER_CONFIG="$DIR/config.json" NADO_HUB="${NADO_HUB:-}" NADO_TOKEN="${NADO_TOKEN:-}" \
    NADO_WORKSPACE="${NADO_WORKSPACE:-}" NADO_LABELS="${NADO_LABELS:-}" "$NODE" <<'NODE'
const fs = require('fs'), os = require('os'), path = require('path');
const e = process.env, file = e.NADO_RUNNER_CONFIG;
const config = {
  hub: e.NADO_HUB.replace(/\/+$/, '').replace(/^http/, 'ws'), token: e.NADO_TOKEN,
  workspaceRoots: (e.NADO_WORKSPACE || path.join(os.homedir(), 'nado-work')).split(':').filter(Boolean),
  labels: (e.NADO_LABELS || '').split(',').filter(Boolean),
  adapters: { codex: {}, copilot: {}, pi: {} },
};
for (const root of config.workspaceRoots) fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
NODE
fi

# Runner owns diagnostic rotation (10 MiB x 5 when available); wrappers do not redirect to unbounded log files.
if [ "$OS" = Darwin ]; then
  mkdir -p "$(dirname "$PLIST")"
  printf '%s\n' '<?xml version="1.0" encoding="UTF-8"?>' \
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">' \
    '<plist version="1.0"><dict><key>Label</key><string>dev.nado.runner</string>' \
    '<key>ProgramArguments</key><array><string>'"$NODE"'</string><string>'"$DIR/lib/nado-runner.mjs"'</string><string>start</string><string>--config</string><string>'"$DIR/config.json"'</string></array>' \
    '<key>EnvironmentVariables</key><dict><key>PATH</key><string>'"$PATH"'</string></dict><key>RunAtLoad</key><true/><key>KeepAlive</key><true/></dict></plist>' >"$PLIST"
  launchctl load -w "$PLIST"
elif command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then
  mkdir -p "$(dirname "$UNIT")"
  printf '%s\n' '[Unit]' 'Description=Nado Agent Runner' 'After=network-online.target' '' '[Service]' \
    "ExecStart=$NODE $DIR/lib/nado-runner.mjs start --config $DIR/config.json" 'Restart=always' 'RestartSec=5' "Environment=PATH=$PATH" '' \
    '[Install]' 'WantedBy=default.target' >"$UNIT"
  systemctl --user daemon-reload
  systemctl --user enable --now nado-runner
else
  echo 'No user service manager; runner was installed but not started. Start it manually with:' >&2
  echo "  $NODE $DIR/lib/nado-runner.mjs start --config $DIR/config.json" >&2
fi

NADO_INSTALL_STATE="$STATE" NADO_INSTALL_DIR="$DIR" "$NODE" -e '
const fs = require("fs");
fs.writeFileSync(process.env.NADO_INSTALL_STATE, JSON.stringify({ schemaVersion: 1, managedPath: process.env.NADO_INSTALL_DIR }, null, 2) + "\n");
'
echo "Runner artifacts installed. Config and durable outbox remain in $DIR."

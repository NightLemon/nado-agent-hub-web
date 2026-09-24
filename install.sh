#!/bin/sh
# One-line runner install for Linux / macOS (runs as you: your CLI logins, GPU and network).
#   curl -fsSL https://<pages>/install.sh | NADO_HUB=https://hub.example.com NADO_TOKEN=nado_m_... sh
# Optional: NADO_WORKSPACE (default ~/nado-work, ':'-separated for several), NADO_LABELS (comma separated),
#           NADO_DOWNLOAD_BASE (where runner/ lives, default: the Pages site), NADO_UNINSTALL=1.
# Re-running upgrades the runner and keeps the existing config unless new values are given.
set -eu

BASE="${NADO_DOWNLOAD_BASE:-https://nightlemon.github.io/nado-agent-hub-web}"
BASE="${BASE%/}"
DIR="$HOME/.nado-runner"
OS="$(uname -s)"
UNIT="$HOME/.config/systemd/user/nado-runner.service"
PLIST="$HOME/Library/LaunchAgents/dev.nado.runner.plist"

stop_service() {
  if [ "$OS" = Darwin ]; then
    launchctl unload "$PLIST" 2>/dev/null || true
  elif command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then
    systemctl --user stop nado-runner 2>/dev/null || true
  fi
  pkill -f "$DIR/lib/nado-runner.mjs" 2>/dev/null || true
}

if [ -n "${NADO_UNINSTALL:-}" ]; then
  stop_service
  if [ "$OS" = Darwin ]; then rm -f "$PLIST"; else
    systemctl --user disable nado-runner 2>/dev/null || true
    rm -f "$UNIT"
  fi
  echo "Runner removed. Config and spool are left in $DIR."
  exit 0
fi

NODE="$(command -v node || true)"
[ -n "$NODE" ] || { echo "Node.js >= 22.13 is required (https://nodejs.org or your package manager)" >&2; exit 1; }
"$NODE" -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)' ||
  { echo "Node.js >= 22.13 is required, found $("$NODE" --version)" >&2; exit 1; }

mkdir -p "$DIR/lib" "$DIR/bin"
echo "Downloading runner from $BASE ..."
curl -fsSL "$BASE/runner/nado-runner.mjs" -o "$DIR/lib/nado-runner.mjs.tmp"
curl -fsSL "$BASE/runner/fake-agent.mjs" -o "$DIR/bin/fake-agent.mjs"
stop_service
mv "$DIR/lib/nado-runner.mjs.tmp" "$DIR/lib/nado-runner.mjs"

if [ -z "${NADO_WORKSPACE:-}" ] && [ ! -f "$DIR/config.json" ]; then NADO_WORKSPACE="$HOME/nado-work"; fi
NADO_HAS_NVIDIA="$(command -v nvidia-smi >/dev/null 2>&1 && echo 1 || true)"
export NADO_HUB="${NADO_HUB:-}" NADO_TOKEN="${NADO_TOKEN:-}" NADO_WORKSPACE="${NADO_WORKSPACE:-}" NADO_LABELS="${NADO_LABELS:-}" NADO_HAS_NVIDIA
"$NODE" -e '
const fs = require("fs"), path = require("path");
const file = path.join(process.env.HOME, ".nado-runner", "config.json");
const c = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
const e = process.env;
if (e.NADO_HUB) c.hub = e.NADO_HUB.replace(/\/+$/, "").replace(/^http/, "ws");
if (e.NADO_TOKEN) c.token = e.NADO_TOKEN;
if (e.NADO_WORKSPACE) c.workspaceRoots = e.NADO_WORKSPACE.split(":").filter(Boolean);
if (e.NADO_LABELS) c.labels = e.NADO_LABELS.split(",").filter(Boolean);
if (!c.labels) c.labels = e.NADO_HAS_NVIDIA ? ["gpu", "cuda"] : [];
c.adapters ??= { claude: {}, codex: {}, copilot: {}, pi: {} };
if (!c.hub || !c.token) { console.error("NADO_HUB and NADO_TOKEN are required for a first install"); process.exit(2); }
for (const r of c.workspaceRoots ?? []) fs.mkdirSync(r, { recursive: true });
fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n", { mode: 0o600 });
console.log(`config: ${file}\n  hub: ${c.hub}\n  workspace: ${(c.workspaceRoots ?? []).join(", ") || "(any)"}`);
'

LOG="$DIR/runner.log"
: >>"$LOG"
MARK="$(wc -c <"$LOG")"
# Agents inherit this PATH, so capture the installing shell's (npm globals, conda, cargo...).
if [ "$OS" = Darwin ]; then
  mkdir -p "$(dirname "$PLIST")"
  cat >"$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>dev.nado.runner</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$DIR/lib/nado-runner.mjs</string><string>start</string></array>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>$PATH</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict></plist>
EOF
  launchctl load -w "$PLIST"
elif command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then
  mkdir -p "$(dirname "$UNIT")"
  cat >"$UNIT" <<EOF
[Unit]
Description=Nado Agent Runner
After=network-online.target

[Service]
ExecStart=$NODE $DIR/lib/nado-runner.mjs start
Restart=always
RestartSec=5
Environment=PATH=$PATH
StandardOutput=append:$LOG
StandardError=append:$LOG

[Install]
WantedBy=default.target
EOF
  systemctl --user daemon-reload
  systemctl --user enable --now nado-runner
  loginctl enable-linger "$(id -un)" 2>/dev/null ||
    echo "Note: run 'sudo loginctl enable-linger $(id -un)' to keep the runner up after you log out."
else
  echo "No systemd user session; starting in the background (not restarted on reboot)."
  nohup "$NODE" "$DIR/lib/nado-runner.mjs" start >>"$LOG" 2>&1 &
fi

i=0
while [ $i -lt 30 ]; do
  sleep 1
  i=$((i + 1))
  NEW="$(tail -c +"$((MARK + 1))" "$LOG")"
  case "$NEW" in *"registered as"* | *"invalid runner config"* | *rror*) break ;; esac
done
printf '%s\n' "$NEW"
case "$NEW" in
  *"registered as"*) echo "Runner is online. Log: $LOG" ;;
  *) echo "Runner did not report in yet; check $LOG" >&2 ;;
esac

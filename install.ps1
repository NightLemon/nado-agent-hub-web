# Runner installer for Windows. It validates all runner artifacts before stopping only its own task.
# Pipe use: $env:NADO_HUB='https://hub.example.com'; $env:NADO_TOKEN='nado_m_...'; irm https://<pages>/install.ps1 | iex
# Local verification: .\install.ps1 -DryRun -InstallDir $env:TEMP\nado-runner-test
param(
  [switch]$DryRun,
  [string]$InstallDir
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$DryRun = $DryRun -or $env:NADO_DRY_RUN -eq '1'
$base = if ($env:NADO_DOWNLOAD_BASE) { $env:NADO_DOWNLOAD_BASE.TrimEnd('/') } else { 'https://nightlemon.github.io/nado-agent-hub-web' }
$uri = [uri]$base
if ($uri.Scheme -ne 'https' -and $env:NADO_ALLOW_INSECURE_DOWNLOAD -ne '1') {
  throw 'NADO_DOWNLOAD_BASE must use HTTPS (set NADO_ALLOW_INSECURE_DOWNLOAD=1 only for a local test server)'
}
$rawDir = if ($InstallDir) { $InstallDir } elseif ($env:NADO_INSTALL_DIR) { $env:NADO_INSTALL_DIR } else { Join-Path $env:USERPROFILE '.nado-runner' }
$dir = [IO.Path]::GetFullPath($rawDir)
$stateFile = Join-Path $dir 'install-state.json'
$expectedNames = @('nado-runner.mjs', 'nado-supervisor.mjs', 'nado-storage.mjs', 'fake-agent.mjs')

function Get-Sha256([string]$file) {
  $stream = [IO.File]::OpenRead($file)
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { return ([BitConverter]::ToString($hasher.ComputeHash($stream))).Replace('-', '').ToLowerInvariant() }
  finally { $hasher.Dispose(); $stream.Dispose() }
}

function Get-ManagedTaskName {
  $hasher = [Security.Cryptography.SHA256]::Create()
  try { $digest = $hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($dir)) }
  finally { $hasher.Dispose() }
  "NadoAgentRunner-$(([BitConverter]::ToString($digest)).Replace('-', '').Substring(0, 12))"
}

function Stop-OwnedTask([string]$taskName) {
  $scheduled = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if (-not $scheduled) { return $false }
  $isOurs = @($scheduled.Actions | Where-Object {
    $command = "$($_.Execute) $($_.Arguments)"
    $command.Contains($dir) -and $command.Contains('nado-runner.mjs')
  }).Count -gt 0
  if (-not $isOurs) {
    Write-Warning "Task $taskName is not registered for $dir; leaving it untouched."
    return $false
  }
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  return $true
}

function Read-StateTaskName {
  if (-not (Test-Path -LiteralPath $stateFile)) { return $null }
  try {
    $state = Get-Content -Raw -LiteralPath $stateFile | ConvertFrom-Json
    if ($state.managedPath -eq $dir -and $state.taskName) { return [string]$state.taskName }
  } catch { Write-Warning "Ignoring unreadable installer state at $stateFile" }
  return $null
}

if ($env:NADO_UNINSTALL) {
  $knownTask = Read-StateTaskName
  $taskName = if ($knownTask) { $knownTask } else { 'NadoAgentRunner' }
  if (Stop-OwnedTask $taskName) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue }
  Write-Host "Runner service removed. Config and durable outbox are left in $dir."
  return
}

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw 'Node.js 22.16+ LTS or 24+ is required: winget install OpenJS.NodeJS.LTS' }
$ver = [version]((& $node --version).TrimStart('v'))
if (-not (($ver.Major -eq 22 -and $ver.Minor -ge 16) -or $ver.Major -ge 24)) { throw "Node.js 22.16+ LTS or 24+ is required, found $ver" }

$stage = Join-Path ([IO.Path]::GetTempPath()) ("nado-runner-download-" + [guid]::NewGuid())
try {
  New-Item -ItemType Directory -Force -Path $stage | Out-Null
  Invoke-WebRequest -UseBasicParsing "$base/runner/manifest.json" -OutFile (Join-Path $stage 'manifest.json')
  foreach ($name in $expectedNames) {
    Invoke-WebRequest -UseBasicParsing "$base/runner/$name" -OutFile (Join-Path $stage $name)
  }
  $manifest = Get-Content -Raw -LiteralPath (Join-Path $stage 'manifest.json') | ConvertFrom-Json
  $actualNames = @($manifest.artifacts | ForEach-Object { [string]$_.name })
  if ($manifest.schemaVersion -ne 1 -or @($actualNames | Sort-Object -Unique).Count -ne $expectedNames.Count -or (Compare-Object $actualNames $expectedNames)) {
    throw 'Runner manifest does not describe exactly the required artifact set'
  }
  foreach ($artifact in $manifest.artifacts) {
    $name = [string]$artifact.name
    $hash = [string]$artifact.sha256
    if ($name -notmatch '^[a-z0-9][a-z0-9.-]*\.mjs$' -or $hash -notmatch '^[a-f0-9]{64}$') { throw "Invalid manifest entry for $name" }
    $actual = Get-Sha256 (Join-Path $stage $name)
    if ($actual -ne $hash) { throw "SHA-256 mismatch for $name" }
  }
  Write-Host "Validated runner artifact set version $($manifest.version) from $base"
  if ($DryRun) {
    Write-Host "Dry run: would install into $dir and restart only its registered scheduled task."
    return
  }

  $config = Join-Path $dir 'config.json'
  if (-not (Test-Path -LiteralPath $config) -and (-not $env:NADO_HUB -or -not $env:NADO_TOKEN)) {
    throw 'NADO_HUB and NADO_TOKEN are required for a first install'
  }
  New-Item -ItemType Directory -Force -Path (Join-Path $dir 'lib'), (Join-Path $dir 'bin') | Out-Null
  # Artifact verification completed above. Do not enumerate or kill arbitrary node processes.
  $taskName = Read-StateTaskName
  if (-not $taskName) { $taskName = Get-ManagedTaskName }
  $stopped = Stop-OwnedTask $taskName
  if (-not $stopped -and $taskName -ne 'NadoAgentRunner') { $null = Stop-OwnedTask 'NadoAgentRunner' }

  Copy-Item -LiteralPath (Join-Path $stage 'nado-runner.mjs') -Destination (Join-Path $dir 'lib/nado-runner.mjs.new') -Force
  Copy-Item -LiteralPath (Join-Path $stage 'nado-supervisor.mjs') -Destination (Join-Path $dir 'lib/nado-supervisor.mjs.new') -Force
  Copy-Item -LiteralPath (Join-Path $stage 'nado-storage.mjs') -Destination (Join-Path $dir 'lib/nado-storage.mjs.new') -Force
  Copy-Item -LiteralPath (Join-Path $stage 'fake-agent.mjs') -Destination (Join-Path $dir 'bin/fake-agent.mjs.new') -Force
  Move-Item -LiteralPath (Join-Path $dir 'lib/nado-runner.mjs.new') -Destination (Join-Path $dir 'lib/nado-runner.mjs') -Force
  Move-Item -LiteralPath (Join-Path $dir 'lib/nado-supervisor.mjs.new') -Destination (Join-Path $dir 'lib/nado-supervisor.mjs') -Force
  Move-Item -LiteralPath (Join-Path $dir 'lib/nado-storage.mjs.new') -Destination (Join-Path $dir 'lib/nado-storage.mjs') -Force
  Move-Item -LiteralPath (Join-Path $dir 'bin/fake-agent.mjs.new') -Destination (Join-Path $dir 'bin/fake-agent.mjs') -Force

  if (-not (Test-Path -LiteralPath $config)) {
    $env:NADO_RUNNER_CONFIG = $config
    & $node -e @'
const fs = require('fs'), path = require('path');
const file = process.env.NADO_RUNNER_CONFIG;
const e = process.env, c = {};
c.hub = e.NADO_HUB.replace(/\/+$/, '').replace(/^http/, 'ws');
c.token = e.NADO_TOKEN;
c.workspaceRoots = (e.NADO_WORKSPACE || path.join(require('os').homedir(), 'nado-work')).split(';').filter(Boolean);
c.labels = (e.NADO_LABELS || '').split(',').filter(Boolean);
c.adapters = { codex: {}, copilot: {}, pi: {} };
for (const root of c.workspaceRoots) fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(file, JSON.stringify(c, null, 2) + '\n', { mode: 0o600 });
'@
    if ($LASTEXITCODE) { throw 'writing config failed' }
  }

  # The Runner owns diagnostic rotation (10 MiB x 5 when available); task wrappers must not create an unbounded log.
  $args = "`"$dir\lib\nado-runner.mjs`" start --config `"$config`""
  $action = New-ScheduledTaskAction -Execute $node -Argument $args
  $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  @{ schemaVersion = 1; managedPath = $dir; taskName = $taskName; version = $manifest.version } |
    ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding utf8
  Start-ScheduledTask -TaskName $taskName
  Write-Host "Runner service started. Config and durable outbox remain in $dir."
} finally {
  Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
}

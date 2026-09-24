# One-line runner install for Windows (runs as you: your CLI logins, GPU and network).
#   $env:NADO_HUB='https://hub.example.com'; $env:NADO_TOKEN='nado_m_...'; irm https://<pages>/install.ps1 | iex
# Optional: NADO_WORKSPACE (default ~\nado-work, ';'-separated for several), NADO_LABELS (comma separated),
#           NADO_DOWNLOAD_BASE (where runner/ lives, default: the Pages site), NADO_UNINSTALL=1.
# Re-running upgrades the runner and keeps the existing config unless new values are given.
& {
  $ErrorActionPreference = 'Stop'
  $ProgressPreference = 'SilentlyContinue'
  $base = if ($env:NADO_DOWNLOAD_BASE) { $env:NADO_DOWNLOAD_BASE.TrimEnd('/') } else { 'https://nightlemon.github.io/nado-agent-hub-web' }
  $dir = Join-Path $env:USERPROFILE '.nado-runner'
  $task = 'NadoAgentRunner'

  if (Get-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue) {
    Stop-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
      Where-Object { $_.CommandLine -like '*nado-runner.mjs*' } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  }
  if ($env:NADO_UNINSTALL) {
    Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Runner removed. Config and spool are left in $dir."
    return
  }

  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
  if (-not $node) { throw 'Node.js >= 22.13 is required: winget install OpenJS.NodeJS.LTS' }
  $ver = [version]((& $node --version).TrimStart('v'))
  if ($ver -lt [version]'22.13.0') { throw "Node.js >= 22.13 is required, found $ver" }

  New-Item -ItemType Directory -Force -Path "$dir\lib", "$dir\bin" | Out-Null
  Write-Host "Downloading runner from $base ..."
  Invoke-WebRequest -UseBasicParsing "$base/runner/nado-runner.mjs" -OutFile "$dir\lib\nado-runner.mjs"
  Invoke-WebRequest -UseBasicParsing "$base/runner/fake-agent.mjs" -OutFile "$dir\bin\fake-agent.mjs"

  # Merge settings into config.json with node (PowerShell 5 would write a BOM).
  if (-not $env:NADO_WORKSPACE -and -not (Test-Path "$dir\config.json")) { $env:NADO_WORKSPACE = Join-Path $env:USERPROFILE 'nado-work' }
  $env:NADO_HAS_NVIDIA = if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) { '1' } else { '' }
  & $node -e @'
const fs = require('fs'), path = require('path');
const file = path.join(process.env.USERPROFILE, '.nado-runner', 'config.json');
const c = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const e = process.env;
if (e.NADO_HUB) c.hub = e.NADO_HUB.replace(/\/+$/, '').replace(/^http/, 'ws');
if (e.NADO_TOKEN) c.token = e.NADO_TOKEN;
if (e.NADO_WORKSPACE) c.workspaceRoots = e.NADO_WORKSPACE.split(';').filter(Boolean);
if (e.NADO_LABELS) c.labels = e.NADO_LABELS.split(',').filter(Boolean);
if (!c.labels) c.labels = e.NADO_HAS_NVIDIA ? ['gpu', 'cuda'] : [];
c.adapters ??= { claude: {}, codex: {}, copilot: {}, pi: {} };
if (!c.hub || !c.token) { console.error('NADO_HUB and NADO_TOKEN are required for a first install'); process.exit(2); }
for (const r of c.workspaceRoots ?? []) fs.mkdirSync(r, { recursive: true });
fs.writeFileSync(file, JSON.stringify(c, null, 2) + '\n');
console.log(`config: ${file}\n  hub: ${c.hub}\n  workspace: ${(c.workspaceRoots ?? []).join(', ') || '(any)'}`);
'@
  if ($LASTEXITCODE) { throw 'writing config failed' }

  $log = "$dir\runner.log"
  # A hidden PowerShell host stays up as the task process (so restart-on-failure applies) and
  # keeps the console out of sight; S4U tasks would avoid the window entirely but need admin.
  # Out-File keeps the log UTF-8 (PowerShell 5 redirection would write UTF-16).
  $cmd = "& '$node' '$dir\lib\nado-runner.mjs' start 2>&1 | % ToString | Out-File -Append -Encoding utf8 '$log'; exit `$LASTEXITCODE"
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command `"$cmd`""
  $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)
  Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
  if (Test-Path $log) { Move-Item -Force $log "$log.old" }
  $mark = 0
  Start-ScheduledTask -TaskName $task

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (-not (Test-Path $log)) { continue }
    $fs = [IO.File]::Open($log, 'Open', 'Read', 'ReadWrite')
    $null = $fs.Seek($mark, 'Begin')
    $new = (New-Object IO.StreamReader($fs)).ReadToEnd()
    $fs.Close()
    if ($new -match 'registered as|invalid runner config|unauthorized|Error') { break }
  }
  Write-Host $new
  if ($new -match 'registered as') { Write-Host "Runner is online. Log: $log" -ForegroundColor Green }
  else { Write-Warning "Runner did not report in yet; check $log" }
}

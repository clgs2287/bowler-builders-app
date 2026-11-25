[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$BaselineDirectory,
    [string]$BackupDirectory,
    [string]$AfterDirectory,
    [datetimeoffset]$CapturedAfter = [datetimeoffset]::MinValue
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$project = 'evgyzbgixhaiykxznqez'
$exports = @(
    'active-snapshot.csv', 'app-settings.csv', 'archives.csv',
    'bowler-identities.csv', 'manual-titles.csv', 'public-reservation-counts.csv',
    'public-reservation-roster.csv', 'reservations.csv', 'schedule-events.csv',
    'storage-objects.csv', 'tournament-drafts.csv'
)

function Read-VerifiedManifest {
    param([string]$Directory, [string]$FileName)
    $manifest = Get-Content -LiteralPath (Join-Path $Directory $FileName) -Raw | ConvertFrom-Json
    if ($manifest.project_ref -cne $project) { throw "Unexpected project in $FileName." }
    return $manifest
}

function Test-ManifestFile {
    param([string]$Directory, $Record)
    if ($Record.name -cne [IO.Path]::GetFileName($Record.name)) { throw 'Invalid manifest file name.' }
    $path = Join-Path $Directory $Record.name
    if ((Get-Item -LiteralPath $path).Length -ne $Record.bytes -or
        (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ne $Record.sha256) {
        throw "Size or SHA-256 mismatch for $($Record.name)."
    }
}

function Read-Preflight {
    param([string]$Directory)
    $manifest = Read-VerifiedManifest $Directory 'preflight-manifest.json'
    if ($manifest.status -cne 'VERIFIED_READ_ONLY_PREFLIGHT') { throw 'The supplied preflight did not finish successfully.' }
    $actual = @($manifest.files | Where-Object name -Like '*.csv' | ForEach-Object name | Sort-Object)
    if (@(Compare-Object -ReferenceObject ($exports | Sort-Object) -DifferenceObject $actual).Count) {
        throw 'The preflight inventory does not contain the expected eleven CSV exports.'
    }
    $hashes = @{}
    foreach ($record in $manifest.files | Where-Object name -Like '*.csv') {
        Test-ManifestFile $Directory $record
        $hashes[$record.name] = $record.sha256
    }

    $active = @(Import-Csv -LiteralPath (Join-Path $Directory 'active-snapshot.csv'))
    if ($active.Count -ne 1 -or $active[0].id -cne 'active') { throw 'Expected the original active snapshot row.' }
    $settings = @(Import-Csv -LiteralPath (Join-Path $Directory 'app-settings.csv'))
    $settingsIds = @($settings.id | Sort-Object)
    if (@(Compare-Object @('multi_day_event', 'reservation_state', 'schedule_locked') $settingsIds).Count) {
        throw 'The protected app settings were not fully exported.'
    }
    $strikefest = ($settings | Where-Object id -CEQ 'multi_day_event').value | ConvertFrom-Json
    if ($strikefest.name -cne 'Strikefest 26') { throw 'The Strikefest 26 workspace is missing.' }
    return [pscustomobject]@{ CapturedAt = [datetimeoffset]$manifest.created_local; Hashes = $hashes }
}

if ($BackupDirectory) {
    $backup = Read-VerifiedManifest $BackupDirectory 'backup-manifest.json'
    if ($backup.status -cne 'VERIFIED_ARCHIVE_READABILITY_ONLY') { throw 'The supplied logical backup has an unexpected status.' }
    $dump = @($backup.files | Where-Object name -CEQ 'staging-public-complete.dump')
    if ($dump.Count -ne 1) { throw 'The verified backup is missing its logical dump manifest entry.' }
    foreach ($record in $backup.files) { Test-ManifestFile $BackupDirectory $record }
    Write-Output 'PASS existing verified staging backup files match their recorded hashes.'
}

$baseline = Read-Preflight $BaselineDirectory
if ($CapturedAfter -ne [datetimeoffset]::MinValue -and $baseline.CapturedAt -le $CapturedAfter) {
    throw "Baseline predates the requested capture threshold ($CapturedAfter)."
}
Write-Output "PASS verified local baseline $($baseline.CapturedAt.ToString('o')) with exact IDs and hashes for all eleven exports."
if ($CapturedAfter -eq [datetimeoffset]::MinValue) {
    Write-Output 'Capture freshness was not checked. Supply -CapturedAfter for the acceptance gate.'
}

if ($AfterDirectory) {
    $after = Read-Preflight $AfterDirectory
    if ($after.CapturedAt -le $baseline.CapturedAt) { throw 'The postflight must be newer than the baseline.' }
    $changed = @($exports | Where-Object { $baseline.Hashes[$_] -cne $after.Hashes[$_] })
    if ($changed.Count) { throw "Baseline and postflight differ in: $($changed -join ', ')." }
    Write-Output 'PASS postflight matches all original IDs and data, including the active snapshot and Strikefest 26.'
}

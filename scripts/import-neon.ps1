$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$dumpPath = "E:\data adi\belajar\6 Oktober 2026 - 8 Oktober 2026\resita-database-terbaru.sql"
$restorePath = Join-Path $projectRoot ".tools\postgresql\bin\pg_restore.exe"

if (!(Test-Path -LiteralPath $dumpPath -PathType Leaf)) {
  throw "Database archive not found: $dumpPath"
}

if (!(Test-Path -LiteralPath $restorePath -PathType Leaf)) {
  throw "PostgreSQL restore tools are missing from $restorePath"
}

$secureConnectionString = Read-Host "Paste the unpooled Neon connection string (input is hidden)" -AsSecureString
$connectionStringPointer = [IntPtr]::Zero
$connectionString = $null
$password = $null

try {
  $connectionStringPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureConnectionString)
  $connectionString = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($connectionStringPointer)
  $connectionString = $connectionString.Trim()
  if ($connectionString.Length -ge 2 -and
      (($connectionString.StartsWith('"') -and $connectionString.EndsWith('"')) -or
       ($connectionString.StartsWith("'") -and $connectionString.EndsWith("'")))) {
    $connectionString = $connectionString.Substring(1, $connectionString.Length - 2)
  }

  $connection = [Uri]$connectionString

  if ($connection.Scheme -notin @("postgres", "postgresql")) {
    throw "The value entered is not a PostgreSQL connection string. Copy the full string beginning with postgres:// or postgresql://."
  }

  if ($connection.Host -notlike "*.neon.tech") {
    throw "The connection host '$($connection.Host)' is not a Neon host. Copy the connection string from the Neon project Connect dialog."
  }

  if ($connection.Host -match "-pooler(?:\.|$)") {
    throw "Use the direct, unpooled Neon connection string for this import."
  }

  $databaseName = [Uri]::UnescapeDataString($connection.AbsolutePath.TrimStart("/"))
  if ($databaseName -ne "neondb") {
    throw "The connection string must target the expected Neon database: neondb."
  }

  $credentials = $connection.UserInfo -split ":", 2
  if ($credentials.Count -ne 2) {
    throw "The Neon connection string must include a username and password."
  }

  $env:PGHOST = $connection.Host
  $env:PGPORT = if ($connection.IsDefaultPort) { "5432" } else { [string]$connection.Port }
  $env:PGDATABASE = $databaseName
  $env:PGUSER = [Uri]::UnescapeDataString($credentials[0])
  $password = [Uri]::UnescapeDataString($credentials[1])
  $env:PGSSLMODE = "require"
  $env:PGPASSWORD = $password
  $env:PGAPPNAME = "resita-neon-import"

  Write-Host "Restoring the local PostgreSQL archive into Neon database '$databaseName'."
  Write-Host "Existing objects will not be dropped; the restore is one transaction and rolls back on error."

  & $restorePath --dbname=$databaseName --no-owner --no-privileges --exit-on-error --single-transaction --verbose $dumpPath
  if ($LASTEXITCODE -ne 0) {
    throw "pg_restore failed with exit code $LASTEXITCODE."
  }

  Write-Host "Neon database restore completed successfully."
}
finally {
  Remove-Item Env:PGHOST, Env:PGPORT, Env:PGDATABASE, Env:PGUSER, Env:PGSSLMODE, Env:PGPASSWORD, Env:PGAPPNAME -ErrorAction SilentlyContinue
  $password = $null
  $connectionString = $null
  if ($connectionStringPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($connectionStringPointer)
  }
  if ($secureConnectionString) {
    $secureConnectionString.Dispose()
  }
}

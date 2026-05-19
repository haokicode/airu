$envPath = Join-Path (Get-Location) ".env.local"

if (-not (Test-Path $envPath)) {
  Write-Error ".env.local not found"
  exit 1
}

$envMap = @{}
Get-Content $envPath | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
    $envMap[$matches[1].Trim()] = $matches[2].Trim().Trim('"').Trim("'")
  }
}

$apiKey = $envMap["NEXT_PUBLIC_FIREBASE_API_KEY"]
$projectId = $envMap["NEXT_PUBLIC_FIREBASE_PROJECT_ID"]
$authDomain = $envMap["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"]

Write-Host "Firebase project: $projectId"
Write-Host "Firebase authDomain: $authDomain"

if (-not $apiKey) {
  Write-Error "NEXT_PUBLIC_FIREBASE_API_KEY is missing"
  exit 1
}

$body = @{
  email = "__probe__@example.invalid"
  password = "not-a-real-password"
  returnSecureToken = $true
} | ConvertTo-Json

try {
  Invoke-RestMethod `
    -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$apiKey" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -TimeoutSec 30 | Out-Null

  Write-Host "Unexpected success. The dummy account exists."
} catch {
  $stream = $_.Exception.Response.GetResponseStream()
  if (-not $stream) {
    Write-Error $_.Exception.Message
    exit 1
  }

  $reader = New-Object System.IO.StreamReader($stream)
  $text = $reader.ReadToEnd()
  $message = ($text | ConvertFrom-Json).error.message

  if ($message -eq "CONFIGURATION_NOT_FOUND") {
    Write-Host "Firebase Auth is not initialized for this project/API key."
    Write-Host "Open Firebase Console > Authentication > Get started, then enable Email/Password."
    exit 2
  }

  if ($message -eq "EMAIL_NOT_FOUND" -or $message -eq "INVALID_LOGIN_CREDENTIALS") {
    Write-Host "Firebase Auth is initialized. Email/Password sign-in reached Auth correctly."
    exit 0
  }

  if ($message -eq "OPERATION_NOT_ALLOWED") {
    Write-Host "Firebase Auth exists, but Email/Password provider is disabled."
    exit 3
  }

  Write-Host "Firebase Auth probe returned: $message"
  exit 4
}

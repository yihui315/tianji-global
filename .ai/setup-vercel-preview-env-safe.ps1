param(
  [switch]$DryRun,
  [string[]]$Only = @()
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$target = "preview"
$envNames = @(
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID",
  "ENABLE_PAY_PER_USE",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "AUTH_URL",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "LOVE_TEST_PAID_INTENT_TEST_MODE_READY",
  "LOVE_TEST_PAID_SMOKE_APPROVED"
)

if ($target -ne "preview") {
  throw "Refusing non-preview Vercel env target."
}

$selected = $envNames
if ($Only.Count -gt 0) {
  $unknown = @($Only | Where-Object { $envNames -notcontains $_ })
  if ($unknown.Count -gt 0) {
    throw "Unknown or disallowed env names: $($unknown -join ', ')"
  }
  $selected = $Only
}

Write-Host "TianJi Love Vercel Preview env setup"
Write-Host "Target: preview only"
Write-Host "Secret handling: values are entered interactively by the human; this script never echoes or stores them."
Write-Host "Do not paste secrets into chat, reports, or git."
Write-Host "Initial LOVE_TEST_PAID_SMOKE_APPROVED value should be false."
Write-Host ""

foreach ($name in $selected) {
  $argsForVercel = @("vercel", "env", "add", $name, $target)
  if ($DryRun) {
    Write-Host "DRY-RUN npx $($argsForVercel -join ' ')"
    continue
  }

  Write-Host "Adding $name to Vercel preview..."
  & npx @argsForVercel
  if ($LASTEXITCODE -ne 0) {
    throw "Vercel env add failed for $name with exit code $LASTEXITCODE"
  }
}

Write-Host ""
Write-Host "Done. Rerun the masked verifier after Vercel preview env values are present in the execution environment."

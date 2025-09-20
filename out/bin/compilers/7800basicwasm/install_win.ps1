# 7800basic Windows Installer (PowerShell)
Write-Host ""
Write-Host "The 7800basic Windows Installer v2 (WASM edition)" -ForegroundColor Cyan
Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

# --- Check for wasmtime ---
if (-not (Get-Command wasmtime -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: wasmtime is not installed or not in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "You can install it using:"
    Write-Host "  - winget install wasmtime"
    Write-Host "  - Or download from https://wasmtime.dev/"
    exit 1
}

# --- Set bas7800dir ---
$bas7800dir = (Get-Location).Path
[Environment]::SetEnvironmentVariable("bas7800dir", $bas7800dir, "User")
Write-Host "bas7800dir set to: $bas7800dir"

# --- Update PATH ---
$path = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($path -notlike "*$bas7800dir*") {
    $newPath = "$bas7800dir;$path"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "Added bas7800dir to PATH"
} else {
    Write-Host "bas7800dir already in PATH"
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "  - Restart your terminal or log out/in for changes to take effect."
Write-Host "  - Then run:  7800basic.bat -v  to test."


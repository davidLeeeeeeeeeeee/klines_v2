# PowerShell Script: Auto build and package for test and production environments

Write-Host "Starting build process for test and production environments..." -ForegroundColor Green
Write-Host ""

# Remove old zip files
if (Test-Path "build_test.zip") {
    Remove-Item "build_test.zip"
    Write-Host "Removed old test environment zip file" -ForegroundColor Yellow
}
if (Test-Path "build_production.zip") {
    Remove-Item "build_production.zip"
    Write-Host "Removed old production environment zip file" -ForegroundColor Yellow
}
Write-Host ""

# Build test environment
Write-Host "Building test environment..." -ForegroundColor Cyan
npm run build:test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Test environment build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Test environment build completed" -ForegroundColor Green
Write-Host ""

# Package test environment
Write-Host "Packaging test environment..." -ForegroundColor Cyan
Compress-Archive -Path "build\*" -DestinationPath "build_test.zip" -Force
Write-Host "Test environment packaged successfully" -ForegroundColor Green
Write-Host ""

# Build production environment
Write-Host "Building production environment..." -ForegroundColor Cyan
npm run build:prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "Production environment build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Production environment build completed" -ForegroundColor Green
Write-Host ""

# Package production environment
Write-Host "Packaging production environment..." -ForegroundColor Cyan
Compress-Archive -Path "build\*" -DestinationPath "build_production.zip" -Force
Write-Host "Production environment packaged successfully" -ForegroundColor Green
Write-Host ""

Write-Host "All builds and packaging completed!" -ForegroundColor Green
Write-Host "Test environment: build_test.zip" -ForegroundColor White
Write-Host "Production environment: build_production.zip" -ForegroundColor White


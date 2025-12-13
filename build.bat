@echo off
echo Starting build process...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0build-all.ps1"

echo.
echo Press any key to exit...
pause >nul


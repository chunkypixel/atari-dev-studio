@echo off
setlocal enabledelayedexpansion
echo.
echo The 7800basic Windows Installer v2
echo -----------------------------------
echo.

REM --- Check for wasmtime ---
where wasmtime >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: wasmtime is not installed or not in PATH.
  echo.
  echo You can install it using:
  echo   - Windows winget: winget install BytecodeAlliance.Wasmtime.Portable
  echo   - Or download from: https://wasmtime.dev/
  echo.
  echo Installation cannot continue without wasmtime.
  pause
  exit /b 1
)

REM --- Set bas7800dir ---
SET bas7800dir=%~dp0
SET bas7800dir=%bas7800dir:~0,-1%
echo   Permanently setting bas7800dir to:
echo      %bas7800dir%
echo.

setx bas7800dir "%bas7800dir%" > install_win.log 2>&1
if %ERRORLEVEL% NEQ 0 goto FAILED

REM --- Update PATH if needed ---
for /f "tokens=2,*" %%A in ('reg query HKCU\Environment /v PATH 2^>nul') do set USERPATH=%%B
if "%USERPATH%"=="" set USERPATH=%PATH%

echo %USERPATH% | find /i "%bas7800dir%" >nul
if %ERRORLEVEL% NEQ 0 (
  echo   Adding bas7800dir to PATH...
  setx PATH "%bas7800dir%;%USERPATH%" >> install_win.log 2>&1
)

echo.
echo Installation complete.
echo   - Reopen any command prompts for changes to take effect.
echo   - Run:  7800basic.bat -v   to test your setup.
echo.
pause
exit /b 0

:FAILED
echo ERROR: Failed to set bas7800dir.
echo This installer requires SETX (Windows Vista or newer).
echo You may need to set environment variables manually.
pause
exit /b 1

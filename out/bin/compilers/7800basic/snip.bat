@echo off
REM Generic wrapper for running WASM tools via wasmtime

setlocal

if "%bas7800dir%"=="" (
  echo ### ERROR: bas7800dir not set
  exit /b 1
)

wasmtime --version >nul 2>&1
if errorlevel 1 (
  echo ### ERROR: wasmtime not found in PATH
  exit /b 1
)

set TOOL=%~n0
wasmtime run --dir . --dir "%bas7800dir%" "%bas7800dir%\%TOOL%.wasm" %*

endlocal


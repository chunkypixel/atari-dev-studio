@echo off
REM 7800basic compilation script (WASM via Wasmtime)

if X"%bas7800dir%" == X goto nobasic

REM --- Check if wasmtime is available ---
wasmtime --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo ### ERROR: Wasmtime is not installed or not in PATH.
  echo.
  echo Install it from https://wasmtime.dev/ or:
  echo   - Windows (Scoop):   scoop install wasmtime
  echo   - Windows (Choco):   choco install wasmtime
  exit /b 1
)

echo Using bas7800dir=%bas7800dir%

REM --- Display tool versions ---
for /f "delims=" %%v in ('wasmtime "%bas7800dir%\7800basic.wasm" -v 2^>nul') do set BASVER=%%v
echo   basic version: %BASVER%

for /f "delims=" %%v in ('wasmtime "%bas7800dir%\dasm.wasm" 2^>nul ^| findstr /B /C:"DASM"') do set DASMVER=%%v
echo   dasm version: %DASMVER%

if X%1 == X (
  echo ### ERROR: No source file specified.
  exit /b 1
)

if "%1" == "-v" (
  REM Just version check
  exit /b 0
)

echo.
echo Starting build of %1

REM --- Preprocess ---
wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800preprocess.wasm" <"%~f1" >"%~1.pre"

REM --- Compile ---
wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800basic.wasm" -i "%bas7800dir%" -b "%~1" -p "%~1.pre"
if errorlevel 1 goto basicerror
del "%~1.pre"

REM --- Postprocess / Optimize ---
if /I "%2"=="-O" (
  wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800postprocess.wasm" -i "%bas7800dir%" | wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800optimize.wasm" > "%~f1.asm"
) else (
  wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800postprocess.wasm" -i "%bas7800dir%" > "%~f1.asm"
)

REM --- Bankset build (if needed) ---
if exist banksetrom.asm (
  wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\dasm.wasm" "%bas7800dir%\includes\banksetskeleton.asm" -I"%bas7800dir%\includes" -f3 -l"banksetrom.list.txt" -s"banksetrom.symbol.txt" -p20 -o"banksetrom.bin" | wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800filter.wasm"
  wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\banksetsymbols.wasm"
)

REM --- Assemble final binary ---
wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\dasm.wasm" "%~f1.asm" -I"%bas7800dir%\includes" -f3 -p20 -l"%~f1.list.txt" -s"%~f1.symbol.txt" -o"%~f1.bin" | wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800filter.wasm"

wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800sign.wasm" -w "%~f1.bin"

if exist banksetrom.asm (
  copy /b "%~f1.bin"+"banksetrom.bin" "%~f1.bin" >nul
  del banksetrom.asm banksetrom.bin
)

REM --- Header + CC2 ---
wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800header.wasm" -o -f a78info.cfg "%~f1.bin"
wasmtime run --dir=. --dir="%bas7800dir%" "%bas7800dir%\7800makecc2.wasm" "%~f1.bin"

goto end

:nobasic
echo ### ERROR: bas7800dir environment variable not set.
echo Please set bas7800dir to the directory where your WASM tools are located.
exit /b 1

:basicerror
echo ### ERROR: Compilation failed.
exit /b 1

:end

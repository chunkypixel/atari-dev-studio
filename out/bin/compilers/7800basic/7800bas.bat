@echo off
REM 7800basic compilation script (WASM via Wasmtime, Windows-safe)

setlocal

if X"%bas7800dir%"==X goto nobasic

REM --- Check if wasmtime is available ---
wasmtime --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ### ERROR: Wasmtime is not installed or not in PATH.
    exit /b 1
)

echo Using bas7800dir=%bas7800dir%

REM --- Display tool versions ---
for /F "delims=" %%v in ('wasmtime "%bas7800dir%\7800basic.wasm" -v 2^>nul') do set BASVER=%%v
echo   basic version: %BASVER%
for /F "delims=" %%v in ('wasmtime "%bas7800dir%\dasm.wasm" 2^>nul') do set DASMVER=%%v & goto dasmgotver
:dasmgotver
echo   dasm version: %DASMVER%


REM --- Source file check ---
if "%~1"=="" (
    echo ### ERROR: No source file specified.
    exit /b 1
)

if /i "%~1"=="-v" (
    REM Just version check
    exit /b 0
)

set srcfile=%~nx1
set srcbase=%~n1
set srcdir=%~dp1
if "%srcdir:~-1%"=="\" set srcdir=%srcdir:~0,-1%

echo.
echo Starting build of %srcfile%

REM --- Preprocess ---
wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" "%bas7800dir%\7800preprocess.wasm" <"%~f1" >"%~1.pre"
if errorlevel 1 goto basicerror

REM --- Compile ---
wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" ^
  "%bas7800dir%\7800basic.wasm" -i "%bas7800dir%" -b "%~f1" -p "%~1.pre"
if errorlevel 1 goto basicerror

del "%~1.pre"

REM --- Postprocess / Optimize ---
if /I "%2"=="-O" (
    wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" "%bas7800dir%\7800postprocess.wasm" -i "%bas7800dir%"  ^
    | wasmtime run --dir "%srcdir%" --dir "%bas7800dir%" "%bas7800dir%\7800optimize.wasm" > "%~1.asm"
) else (
    wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" "%bas7800dir%\7800postprocess.wasm" -i "%bas7800dir%" > "%~1.asm"
)

REM --- Assembly Banksets, if applicable
if not exist banksetrom.asm goto nobankset1
wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%"  "%bas7800dir%\dasm.wasm" "%bas7800dir%/includes/banksetskeleton.asm" -I"%bas7800dir%/includes" -f3 -l"banksetrom.list.txt" -s"banksetrom.symbol.txt" -p20 -o"banksetrom.bin"
wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%"  "%bas7800dir%\banksetsymbols.wasm"
:nobankset1

REM --- Assemble final binary ---
wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%\includes" ^
  "%bas7800dir%\dasm.wasm" "%~1.asm" -I. -I"%bas7800dir%\includes" -f3 -p20 -l"%~1.list.txt" -s"%~1.symbol.txt" -o"%~1.bin" | wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" "%bas7800dir%\7800filter.wasm"

wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" ^
  "%bas7800dir%\7800sign.wasm" -w "%~1.bin"

REM --- Combine and cleanup Banksets, if applicable
if not exist banksetrom.asm goto nobankset2
  copy /b "%~f1.bin"+"banksetrom.bin" "%~f1.bin"
  del banksetrom.asm banksetrom.bin
:nobankset2

REM --- Header + CC2 ---
wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" ^
  "%bas7800dir%\7800header.wasm" -o -f a78info.cfg "%~1.bin"

wasmtime run --dir . --dir "%srcdir%" --dir "%bas7800dir%" ^
  "%bas7800dir%\7800makecc2.wasm" "%~1.bin"

goto end

:basicerror
echo.
echo ### ERROR: 7800basic compilation failed.
exit /b 1

:nobasic
echo.
echo ### ERROR: bas7800dir not defined.
exit /b 1

:end
endlocal
exit /b 0



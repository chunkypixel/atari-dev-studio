@echo off
setlocal enabledelayedexpansion
echo.
echo The 7800DevKit installation batch file v1.1
echo ------------------------------------------
echo.
echo   Permanently setting the asm7800dir variable to:
echo.
SET asm7800dir=%~dp0
SET asm7800dir=%asm7800dir:~0,-1%
echo      %asm7800dir%
echo.
echo setx asm7800dir "%asm7800dir%" > install_win.log
setx asm7800dir "%asm7800dir%" 2>> install_win.log
echo.
set asm7800dir=%asm7800dir%;
if %ERRORLEVEL% NEQ 0 GOTO FAILED
reg query HKCU\Environment /v PATH >NUL 2>NUL
if %ERRORLEVEL% NEQ 0 GOTO SKIPENVCHECK
for /f "usebackq tokens=2,*" %%A in (`reg query HKCU\Environment /v PATH`) do set USERPATH=%%B 
:SKIPENVCHECK
IF NOT "%USERPATH%"=="" call set USERPATH=%%USERPATH:!asm7800dir!=%%
echo set USERPATH "%asm7800dir%%USERPATH%" >> install_win.log
set USERPATH "%asm7800dir%%USERPATH%" 2>> install_win.log
echo.
echo   Updating the user PATH variable so this asm7800dir directory is your primary
echo.
echo setx PATH "%asm7800dir%%USERPATH%" >> install_win.log
setx PATH "%asm7800dir%%USERPATH%" 2>> install_win.log
echo.
:SKIPUPDATE
echo   You should re-open any programs or command-line windows that rely on this
echo   variable so they take on the new value.
echo.
echo   You should re-run this batch file if you ever change the location of the
echo   7800DevKit directory.
echo.
pause
exit

:FAILED
echo   Setting the asm7800dir variable failed. This batch file requires SETX,
echo   which comes with Windows Vista, and later versions of Windows.
echo.
echo   You should obtain a copy of SETX and re-run this script, or set the
echo   asm7800dir variable manually.
echo.
pause

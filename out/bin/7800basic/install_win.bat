@echo off
setlocal enabledelayedexpansion
echo.
echo The 7800basic installation batch file v1.1
echo ------------------------------------------
echo.
echo   Permanently setting the bas7800dir variable to:
echo.
SET bas7800dir=%~dp0
SET bas7800dir=%bas7800dir:~0,-1%
echo      %bas7800dir%
echo.
echo setx bas7800dir "%bas7800dir%" > install_win.log
setx bas7800dir "%bas7800dir%" 2>> install_win.log
echo.
set bas7800dir=%bas7800dir%;
if %ERRORLEVEL% NEQ 0 GOTO FAILED
reg query HKCU\Environment /v PATH >NUL 2>NUL
if %ERRORLEVEL% NEQ 0 GOTO SKIPENVCHECK
for /f "usebackq tokens=2,*" %%A in (`reg query HKCU\Environment /v PATH`) do set USERPATH=%%B 
:SKIPENVCHECK
IF NOT "%USERPATH%"=="" call set USERPATH=%%USERPATH:!bas7800dir!=%%
echo set USERPATH "%bas7800dir%%USERPATH%" >> install_win.log
set USERPATH "%bas7800dir%%USERPATH%" 2>> install_win.log
echo.
echo   Updating the user PATH variable so this bas7800dir directory is your primary
echo.
echo setx PATH "%bas7800dir%%USERPATH%" >> install_win.log
setx PATH "%bas7800dir%%USERPATH%" 2>> install_win.log
echo.
:SKIPUPDATE
echo   You should re-open any programs or command-line windows that rely on this
echo   variable so they take on the new value.
echo.
echo   You should re-run this batch file if you ever change the location of the
echo   7800basic directory.
echo.
pause
exit

:FAILED
echo   Setting the bas7800dir variable failed. This batch file requires SETX,
echo   which comes with Windows Vista, and later versions of Windows.
echo.
echo   You should obtain a copy of SETX and re-run this script, or set the
echo   bas7800dir variable manually.
echo.
pause

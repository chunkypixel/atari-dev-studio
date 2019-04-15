@echo off
if X"%asm7800dir%" == X goto noasm
dasm "%~f1" -I"%asm7800dir%"/includes -f3 -o"%~f1.bin"
7800sign -w "%~f1.bin"
goto end

:noasm
echo asm7800dir environment variable not set.

:end

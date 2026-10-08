@echo off
setlocal
cd /d "%~dp0apps\mobile" || exit /b 1
call npm.cmd start
if errorlevel 1 pause

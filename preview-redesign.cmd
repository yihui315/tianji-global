@echo off
setlocal
chcp 65001 >nul
title TianJi Global · Redesign Preview (port 3050)

cd /d "%~dp0"

echo ============================================================
echo  TianJi Global  -  Redesign Preview
echo  Branch: redesign-home-landing-20260420
echo ============================================================
echo.

if not exist node_modules (
  echo [setup] node_modules not found, running npm install ...
  call npm install
  if errorlevel 1 goto :err
)

echo [start] launching next dev on port 3050 ...
echo [open ] once you see "Ready in ...", open: http://localhost:3050/
echo.

set NODE_OPTIONS=--max-old-space-size=4096
call npx next dev -p 3050

goto :eof

:err
echo.
echo [error] npm install failed. Check the messages above.
pause
exit /b 1

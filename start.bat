@echo off
cd /d "%~dp0"
echo COZY 커피 주문앱 시작 중...
call npm run install:all 2>nul
call npm run db:init 2>nul
call npm run build
start "" "http://localhost:3001"
call npm run start --prefix server

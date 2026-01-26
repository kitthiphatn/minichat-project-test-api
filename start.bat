@echo off
echo ========================================
echo Starting Mini Chat Ollama
echo ========================================
echo.

REM Start Backend
echo [1/3] Starting Backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 /nobreak > nul

REM Start Frontend
echo [2/3] Starting Frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak > nul

REM Start Cloudflare Tunnel
echo [3/3] Starting Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel run minichat"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo URLs:
echo - Local:  http://localhost:3000
echo - Public: https://chat.clubfivem.com
echo.
echo Press any key to exit this window...
pause > nul

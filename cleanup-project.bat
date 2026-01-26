@echo off
echo ========================================
echo Cleaning Up Minichat Project
echo ========================================
echo.

echo [1/3] Creating scripts folder...
if not exist "scripts" mkdir scripts
echo Done!
echo.

echo [2/3] Moving .bat files to scripts folder...
move /Y "check-ollama.bat" "scripts\" 2>nul
move /Y "test-ollama-api.bat" "scripts\" 2>nul
move /Y "test-backend-request.bat" "scripts\" 2>nul
move /Y "download-all-models.bat" "scripts\" 2>nul
move /Y "fix-tunnel.bat" "scripts\" 2>nul
echo Done!
echo.

echo [3/3] Deleting redundant documentation files...
del /Q "FIX_TUNNEL_CONFIG.md" 2>nul
del /Q "DEPLOYMENT.md" 2>nul
del /Q "API_GUIDE.md" 2>nul
del /Q "SETUP_GUIDE.md" 2>nul
del /Q "QUICKSTART.md" 2>nul
del /Q "PROJECT_SUMMARY.md" 2>nul
del /Q "PACKAGE_SUMMARY.md" 2>nul
del /Q "HOW_TO_USE_ANTIGRAVITY.md" 2>nul
del /Q "PROMPT_FOR_CLAUDE.md" 2>nul
del /Q "query" 2>nul
echo Done!
echo.

echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Summary:
echo - Created scripts/ folder
echo - Moved 5 .bat files to scripts/
echo - Deleted 10 redundant files
echo.
echo Remaining files in root:
echo - README.md
echo - README.th.md
echo - CHANGELOG.md
echo - CONTRIBUTING.md
echo - LICENSE
echo - package.json
echo - docker-compose.yml
echo - cloudflared-config.yml
echo - setup.sh
echo - start.bat
echo - backend/
echo - frontend/
echo - manual/
echo - scripts/
echo.
pause

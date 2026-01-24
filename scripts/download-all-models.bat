@echo off
echo ========================================
echo Download All Ollama Models
echo ========================================
echo.
echo This script will download all models listed in the backend.
echo Each model is 3-7 GB. Total: ~30 GB
echo.
echo Models to download:
echo - llama3 (4.7 GB) - Already installed
echo - mistral (4.1 GB)
echo - phi3 (2.3 GB)
echo - gemma (3.3 GB) - Already installed as gemma3:4b
echo - codellama (3.8 GB)
echo.
pause
echo.

echo [1/5] Downloading mistral...
ollama pull mistral
echo.

echo [2/5] Downloading phi3...
ollama pull phi3
echo.

echo [3/5] Downloading gemma...
ollama pull gemma
echo.

echo [4/5] Downloading codellama...
ollama pull codellama
echo.

echo [5/5] Listing all installed models...
ollama list
echo.

echo ========================================
echo Download Complete!
echo ========================================
echo.
echo All models are now available for use.
echo Refresh your browser to see the updated model list.
echo.
pause

@echo off
echo ========================================
echo Ollama Diagnostic Script
echo ========================================
echo.

echo [1/5] Checking if Ollama is installed...
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is NOT installed!
    echo.
    echo Please install Ollama from: https://ollama.ai/download
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Ollama is installed
)
echo.

echo [2/5] Checking if Ollama service is running...
netstat -ano | findstr :11434 >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Ollama is NOT running on port 11434
    echo.
    echo Starting Ollama service...
    start "Ollama Service" cmd /k "ollama serve"
    timeout /t 3 /nobreak >nul
    echo [OK] Ollama service started
) else (
    echo [OK] Ollama is running on port 11434
)
echo.

echo [3/5] Testing Ollama API connection...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to Ollama API
    echo Please make sure Ollama is running: ollama serve
    pause
    exit /b 1
) else (
    echo [OK] Ollama API is responding
)
echo.

echo [4/5] Checking installed models...
echo.
ollama list
echo.

echo [5/5] Checking if llama3 model is installed...
ollama list | findstr "llama3" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] llama3 model is NOT installed!
    echo.
    echo Do you want to download llama3 model now? (This will take 4-5 GB)
    echo Press Y to download, or N to skip
    choice /c YN /n /m "Download llama3? (Y/N): "
    if errorlevel 2 goto skip_download
    if errorlevel 1 goto download_model
    
    :download_model
    echo.
    echo Downloading llama3 model (this may take several minutes)...
    ollama pull llama3
    echo [OK] llama3 model downloaded successfully
    goto test_model
    
    :skip_download
    echo.
    echo [SKIPPED] llama3 model download skipped
    echo You can download it later with: ollama pull llama3
    goto end
) else (
    echo [OK] llama3 model is installed
)

:test_model
echo.
echo [6/6] Testing llama3 model...
echo.
curl -X POST http://localhost:11434/api/chat -H "Content-Type: application/json" -d "{\"model\":\"llama3\",\"messages\":[{\"role\":\"user\",\"content\":\"Say hello in Thai\"}],\"stream\":false}"
echo.
echo.

:end
echo ========================================
echo Diagnostic Complete!
echo ========================================
echo.
echo Summary:
echo - Ollama installed: YES
echo - Ollama running: Check above
echo - llama3 model: Check above
echo.
echo If everything is OK, your backend should now be able to use Ollama!
echo.
pause

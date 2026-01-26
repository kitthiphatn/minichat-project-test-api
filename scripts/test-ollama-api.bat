@echo off
echo ========================================
echo Testing Ollama API Endpoints
echo ========================================
echo.

echo [Test 1] GET /api/tags (List models)
echo.
curl -s http://localhost:11434/api/tags
echo.
echo.

echo [Test 2] POST /api/chat (Send message to llama3)
echo.
curl -X POST http://localhost:11434/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"llama3\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello, respond in Thai\"}],\"stream\":false}"
echo.
echo.

echo [Test 3] GET /api/version (Check Ollama version)
echo.
curl -s http://localhost:11434/api/version
echo.
echo.

echo ========================================
echo Test Complete!
echo ========================================
echo.
echo If you see JSON responses above, Ollama is working correctly!
echo.
pause

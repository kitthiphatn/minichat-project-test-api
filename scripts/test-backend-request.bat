@echo off
echo Testing exact request that backend sends to Ollama...
echo.

curl -X POST http://localhost:11434/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"llama3\",\"messages\":[{\"role\":\"user\",\"content\":\"Test message\"}],\"stream\":false}"

echo.
echo.
echo If you see a response above, the endpoint is correct.
echo If you see 404, there's an endpoint problem.
pause

# Backend - Mini Chat Ollama

Express.js backend API for Mini Chat Ollama with MongoDB integration and support for 4 AI providers.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (using Docker)
cd ..
docker-compose up -d

# Run development server
npm run dev

# Or run production server
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Required
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-chat-ollama
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGIN=http://localhost:3000

# Optional (for cloud AI providers)
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

## API Endpoints

### Health Check
```
GET /health
```

### Chat Endpoints
```
GET  /api/chat/providers  - Get available AI providers
GET  /api/chat/history    - Get chat history
POST /api/chat/message    - Send message to AI
POST /api/chat/clear      - Clear chat history
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── Message.js           # Message schema
│   ├── routes/
│   │   └── chat.js              # API routes
│   ├── controllers/
│   │   └── chatController.js    # Business logic
│   └── server.js                # Express app
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **axios** - HTTP client for AI APIs
- **morgan** - HTTP request logger
- **nodemon** - Development auto-reload

## AI Providers

### 1. Ollama (Local)
- **Required**: Ollama running locally
- **Endpoint**: http://localhost:11434
- **No API key needed**

### 2. OpenRouter (Cloud)
- **Required**: API key from https://openrouter.ai/
- **Set**: `OPENROUTER_API_KEY` in .env

### 3. Groq (Fast)
- **Required**: API key from https://console.groq.com/
- **Set**: `GROQ_API_KEY` in .env

### 4. Anthropic (Claude)
- **Required**: API key from https://console.anthropic.com/
- **Set**: `ANTHROPIC_API_KEY` in .env

## Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test providers endpoint
curl http://localhost:5000/api/chat/providers

# Test send message
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "provider": "ollama",
    "model": "llama3"
  }'

# Test get history
curl http://localhost:5000/api/chat/history

# Test clear chat
curl -X POST http://localhost:5000/api/chat/clear \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "default"}'
```

## Troubleshooting

### MongoDB Connection Failed
```bash
# Make sure MongoDB is running
docker-compose up -d

# Or start local MongoDB
mongod
```

### Ollama Not Responding
```bash
# Start Ollama
ollama serve

# Pull a model
ollama pull llama3
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

## Development

```bash
# Install dependencies
npm install

# Run with auto-reload
npm run dev

# Run production
npm start
```

## License

MIT

# 🤖 Mini Chat Ollama

A modern, full-stack chat application with support for multiple AI providers including Ollama, OpenRouter, Groq, and Anthropic. Built with Next.js 14, Express.js, and MongoDB.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [AI Providers](#ai-providers)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Development Notes](#development-notes)
- [Contributing](#contributing)
- [License](#license)
- [Author & Acknowledgments](#author--acknowledgments)

## Overview

**Mini Chat Ollama** is a production-ready chat application that demonstrates modern full-stack development practices. It provides a clean, professional interface for interacting with various AI models through a unified API.

### What Makes This Special?

- **Multi-Provider Support**: Switch between 4 different AI providers seamlessly
- **Local-First**: Works with Ollama out of the box (no API keys needed)
- **Production Ready**: Complete error handling, logging, and data persistence
- **Well Documented**: 30KB+ of comprehensive documentation
- **Easy Setup**: Automated setup script gets you running in minutes

### Project Context

This project was created as a technical interview assignment with the following requirements:
- Build a chat interface with AI integration
- Store messages in MongoDB
- Implement proper error handling
- Create comprehensive documentation

**Time Spent**: 4-5 hours (recommended: 2-3 hours)

## Features

### ✅ Core Features (Required)

- **Single-page chat interface** - Clean, intuitive UI
- **Send/receive messages from AI** - Real-time communication
- **Message history in MongoDB** - Persistent storage
- **User/AI message distinction** - Different styling for clarity
- **Loading indicator** - Visual feedback during AI processing
- **Error handling** - Graceful error messages
- **Data persistence** - Messages survive page reloads
- **Message length limit** - 500 character maximum

### 🎁 Bonus Features

- **Auto-scroll** - Automatically scroll to newest messages
- **Clear chat button** - Reset conversation with one click
- **Multi-session schema** - Database ready for multiple chat sessions
- **Character counter** - Real-time character count (0/500)
- **Response time display** - See how fast each AI responds

### 🚀 Extra Features (Beyond Requirements)

- **4 AI Providers** - Ollama, OpenRouter, Groq, Anthropic
- **Dynamic model selection** - Choose from 15+ AI models
- **Provider detection** - Automatically detect available providers
- **Professional UI/UX** - Gradient background, smooth animations
- **Comprehensive docs** - 20KB+ documentation
- **Docker support** - Easy MongoDB setup
- **Setup automation** - One-command installation
- **Health check endpoint** - Monitor server status
- **Request logging** - Track all API calls

## Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime environment |
| Express.js | v4.18 | Web framework |
| MongoDB | v7.0 | NoSQL database |
| Mongoose | v8.0 | ODM for MongoDB |
| Axios | v1.6 | HTTP client for AI APIs |
| CORS | v2.8 | Cross-origin resource sharing |
| Morgan | v1.10 | HTTP request logger |
| dotenv | v16.3 | Environment variables |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | v14.0 | React framework |
| React | v18.2 | UI library |
| Tailwind CSS | v3.3 | Utility-first CSS |
| Axios | v1.6 | HTTP client |
| PostCSS | v8.4 | CSS processing |

### DevOps

- **Docker Compose** - MongoDB containerization
- **Bash Scripts** - Setup automation
- **Git** - Version control

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (Port 3000)                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  ChatInterface Component                        │  │  │
│  │  │  - Message display                              │  │  │
│  │  │  - Provider/Model selection                     │  │  │
│  │  │  - Input handling                               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend (Port 5000)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Routes Layer                                         │  │
│  │  GET  /api/chat/providers                            │  │
│  │  GET  /api/chat/history                              │  │
│  │  POST /api/chat/message                              │  │
│  │  POST /api/chat/clear                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Controller Layer                                     │  │
│  │  - Input validation                                   │  │
│  │  - AI provider routing                                │  │
│  │  - Response formatting                                │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────┬───────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────┐          ┌──────────────────────────┐
│   MongoDB (27017)    │          │    AI Providers          │
│  ┌────────────────┐  │          │  ┌────────────────────┐  │
│  │   Messages     │  │          │  │ Ollama (Local)     │  │
│  │   Collection   │  │          │  │ OpenRouter (Cloud) │  │
│  │                │  │          │  │ Groq (Fast)        │  │
│  │  - role        │  │          │  │ Anthropic (Claude) │  │
│  │  - content     │  │          │  └────────────────────┘  │
│  │  - provider    │  │          └──────────────────────────┘
│  │  - model       │  │
│  │  - sessionId   │  │
│  │  - metadata    │  │
│  │  - timestamps  │  │
│  └────────────────┘  │
└──────────────────────┘
```

### Data Flow

1. **User Input** → Frontend captures message
2. **API Request** → POST to `/api/chat/message`
3. **Validation** → Backend validates input (length, required fields)
4. **Save User Message** → Store in MongoDB
5. **AI Request** → Call selected provider's API
6. **Save AI Response** → Store in MongoDB
7. **Return Data** → Send both messages to frontend
8. **Update UI** → Display messages, scroll to bottom

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js** v18.0.0 or higher
  ```bash
  # Check version
  node --version
  
  # Download from https://nodejs.org/
  ```

- **npm** v9.0.0 or higher (comes with Node.js)
  ```bash
  npm --version
  ```

- **MongoDB** (choose one):
  - **Option A**: Docker (recommended)
    ```bash
    docker --version
    docker-compose --version
    ```
  - **Option B**: Local MongoDB installation
    ```bash
    mongod --version
    # Download from https://www.mongodb.com/try/download/community
    ```

- **Ollama** (for local AI)
  ```bash
  ollama --version
  # Download from https://ollama.ai/
  ```

### Optional (for cloud AI providers)

- **OpenRouter API Key** - Get from https://openrouter.ai/
- **Groq API Key** - Get from https://console.groq.com/
- **Anthropic API Key** - Get from https://console.anthropic.com/

## Installation

### Option 1: Automated Setup (Recommended for Linux/Mac)

```bash
# Clone or navigate to project directory
cd mini-chat-ollama

# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

The script will:
- Check all prerequisites
- Install backend dependencies
- Install frontend dependencies
- Create `.env` files from templates
- Start MongoDB with Docker Compose
- Display next steps

### Option 2: Manual Setup (Windows or Custom)

#### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

Expected packages:
- express
- mongoose
- cors
- dotenv
- axios
- morgan
- nodemon (dev)

#### Step 2: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

Expected packages:
- next
- react
- react-dom
- axios
- tailwindcss
- autoprefixer
- postcss

#### Step 3: Setup Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mini-chat-ollama
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGIN=http://localhost:3000

# Optional: Add API keys for cloud providers
# OPENROUTER_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
```

**Frontend:**
```bash
cd ../frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Step 4: Start MongoDB

**Using Docker (recommended):**
```bash
cd ..
docker-compose up -d
```

**Using local MongoDB:**
```bash
mongod --dbpath /path/to/data/directory
```

#### Step 5: Setup Ollama

```bash
# Start Ollama server
ollama serve

# In another terminal, pull a model
ollama pull llama3

# Verify
ollama list
```

## Configuration

### Environment Variables

#### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Backend server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `OLLAMA_BASE_URL` | Yes | http://localhost:11434 | Ollama API endpoint |
| `OPENROUTER_API_KEY` | No | - | OpenRouter API key |
| `GROQ_API_KEY` | No | - | Groq API key |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key |
| `CORS_ORIGIN` | No | http://localhost:3000 | Allowed CORS origin |

#### Frontend (.env.local)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API base URL |

### AI Provider Configuration

Each provider has specific requirements:

**Ollama (Local)**
- No API key needed
- Requires Ollama running locally
- Default endpoint: http://localhost:11434

**OpenRouter**
- Requires API key from https://openrouter.ai/
- Set `OPENROUTER_API_KEY` in backend/.env

**Groq**
- Requires API key from https://console.groq.com/
- Set `GROQ_API_KEY` in backend/.env

**Anthropic**
- Requires API key from https://console.anthropic.com/
- Set `ANTHROPIC_API_KEY` in backend/.env

## Running the Application

### Development Mode

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[INFO] Server running on http://localhost:5000
[INFO] CORS enabled for http://localhost:3000
[INFO] Available providers: ollama
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Production Mode

**Build and run backend:**
```bash
cd backend
npm start
```

**Build and run frontend:**
```bash
cd frontend
npm run build
npm start
```

### Accessing the Application

1. Open your browser to **http://localhost:3000**
2. You should see the chat interface
3. Select a provider (Ollama by default)
4. Select a model (llama3 by default)
5. Type a message and press Send or Enter
6. Wait for the AI response (5-10 seconds)

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### 1. Get Available Providers

```http
GET /api/chat/providers
```

**Response:**
```json
{
  "providers": {
    "ollama": {
      "name": "Ollama (Local)",
      "available": true,
      "models": ["llama3", "llama3:70b", "mistral", "codellama", "phi3", "gemma"]
    },
    "openrouter": {
      "name": "OpenRouter",
      "available": false,
      "models": ["meta-llama/llama-3-8b-instruct", "..."]
    },
    "groq": {
      "name": "Groq",
      "available": false,
      "models": ["llama3-8b-8192", "..."]
    },
    "anthropic": {
      "name": "Anthropic",
      "available": false,
      "models": ["claude-3-haiku-20240307", "..."]
    }
  }
}
```

#### 2. Get Chat History

```http
GET /api/chat/history?sessionId=default&limit=50
```

**Query Parameters:**
- `sessionId` (optional): Session ID, default: "default"
- `limit` (optional): Number of messages, default: 50

**Response:**
```json
{
  "messages": [
    {
      "_id": "...",
      "role": "user",
      "content": "Hello!",
      "provider": "ollama",
      "model": "llama3",
      "sessionId": "default",
      "createdAt": "2024-12-09T10:00:00.000Z",
      "updatedAt": "2024-12-09T10:00:00.000Z"
    },
    {
      "_id": "...",
      "role": "ai",
      "content": "Hello! How can I help you today?",
      "provider": "ollama",
      "model": "llama3",
      "sessionId": "default",
      "metadata": {
        "responseTime": 2345
      },
      "createdAt": "2024-12-09T10:00:02.000Z",
      "updatedAt": "2024-12-09T10:00:02.000Z"
    }
  ]
}
```

#### 3. Send Message

```http
POST /api/chat/message
```

**Request Body:**
```json
{
  "message": "What is the capital of France?",
  "provider": "ollama",
  "model": "llama3",
  "sessionId": "default"
}
```

**Validation:**
- `message`: Required, string, max 500 characters
- `provider`: Required, one of: ollama, openrouter, groq, anthropic
- `model`: Required, string
- `sessionId`: Optional, string, default: "default"

**Response:**
```json
{
  "userMessage": {
    "_id": "...",
    "role": "user",
    "content": "What is the capital of France?",
    "provider": "ollama",
    "model": "llama3",
    "sessionId": "default",
    "createdAt": "2024-12-09T10:00:00.000Z"
  },
  "aiMessage": {
    "_id": "...",
    "role": "ai",
    "content": "The capital of France is Paris.",
    "provider": "ollama",
    "model": "llama3",
    "sessionId": "default",
    "metadata": {
      "responseTime": 1523
    },
    "createdAt": "2024-12-09T10:00:01.523Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Message is required and must be less than 500 characters"
}
```

#### 4. Clear Chat

```http
POST /api/chat/clear
```

**Request Body:**
```json
{
  "sessionId": "default"
}
```

**Response:**
```json
{
  "message": "Chat history cleared successfully",
  "deletedCount": 42
}
```

#### 5. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-12-09T10:00:00.000Z",
  "uptime": 12345,
  "mongodb": "connected"
}
```

## Project Structure

```
mini-chat-ollama/
├── backend/                      # Express.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # MongoDB connection setup
│   │   ├── models/
│   │   │   └── Message.js       # Mongoose schema and methods
│   │   ├── routes/
│   │   │   └── chat.js          # API route definitions
│   │   ├── controllers/
│   │   │   └── chatController.js # Business logic for 4 providers
│   │   └── server.js            # Express app entry point
│   ├── .env.example             # Environment variable template
│   ├── package.json             # Backend dependencies
│   └── README.md                # Backend documentation
│
├── frontend/                     # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js         # Main chat page
│   │   │   ├── layout.js       # Root layout with metadata
│   │   │   └── globals.css     # Global styles + Tailwind
│   │   ├── components/
│   │   │   └── ChatInterface.js # Main chat UI component
│   │   └── lib/
│   │       └── api.js          # API client functions
│   ├── .env.local.example      # Frontend env template
│   ├── next.config.js          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── postcss.config.js       # PostCSS config
│   ├── package.json            # Frontend dependencies
│   └── README.md               # Frontend documentation
│
├── docker-compose.yml           # MongoDB container setup
├── setup.sh                     # Automated setup script
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json
│
├── README.md                    # This file - main documentation
├── QUICKSTART.md                # 5-minute quick start guide
├── PROJECT_SUMMARY.md           # Project overview
├── CONTRIBUTING.md              # Contribution guidelines
├── CHANGELOG.md                 # Version history
└── LICENSE                      # MIT License
```

### Key Files Explained

**Backend:**
- `server.js` - Express app setup, middleware, routes
- `database.js` - MongoDB connection with retry logic
- `Message.js` - Mongoose model with static methods
- `chatController.js` - 4 provider functions + main controllers
- `chat.js` - Express router with 4 endpoints

**Frontend:**
- `page.js` - Main page component (imports ChatInterface)
- `ChatInterface.js` - Complete chat UI with state management
- `api.js` - Axios client with 4 API functions
- `globals.css` - Tailwind imports + custom animations
- `layout.js` - HTML structure and metadata

## Usage Guide

### Basic Chat Flow

1. **Open the application** at http://localhost:3000
2. **Select a provider** from the dropdown (Ollama is default)
3. **Select a model** from the model dropdown
4. **Type your message** in the input field (max 500 characters)
5. **Press Send** or hit Enter
6. **Wait for response** - loading indicator will show
7. **View the conversation** - messages appear in the chat area
8. **Continue chatting** - context is maintained

### Switching Providers

1. Click the **Provider dropdown**
2. Select a different provider (must have API key configured)
3. The model dropdown will update with available models
4. Continue chatting with the new provider

### Clearing Chat

1. Click the **Clear Chat** button
2. Confirm the action
3. All messages will be deleted from the database
4. The UI will reset to empty state

### Character Counter

- Located below the input field
- Shows current/max characters (e.g., "0/500")
- Updates in real-time as you type
- Turns red when approaching limit

### Response Time

- Displayed below each AI message
- Shows how long the AI took to respond
- Format: "Response time: 2.3s"
- Useful for comparing provider speeds

## AI Providers

### 1. Ollama (Local)

**Pros:**
- ✅ Free and open source
- ✅ Runs locally (privacy)
- ✅ No API key needed
- ✅ No rate limits
- ✅ Works offline

**Cons:**
- ❌ Requires local installation
- ❌ Needs GPU for good performance
- ❌ Slower than cloud providers

**Available Models:**
- `llama3` - Meta's Llama 3 8B (recommended)
- `llama3:70b` - Llama 3 70B (requires powerful GPU)
- `mistral` - Mistral 7B
- `codellama` - Code-specialized Llama
- `phi3` - Microsoft's Phi-3
- `gemma` - Google's Gemma

**Setup:**
```bash
ollama serve
ollama pull llama3
```

### 2. OpenRouter (Cloud)

**Pros:**
- ✅ Access to many models
- ✅ Fast responses
- ✅ No local resources needed
- ✅ Pay-as-you-go pricing

**Cons:**
- ❌ Requires API key
- ❌ Costs money
- ❌ Rate limits apply

**Available Models:**
- `meta-llama/llama-3-8b-instruct`
- `meta-llama/llama-3-70b-instruct`
- `mistralai/mistral-7b-instruct`
- `google/gemini-pro`
- `anthropic/claude-3-haiku`

**Setup:**
1. Get API key from https://openrouter.ai/
2. Add to `backend/.env`: `OPENROUTER_API_KEY=your_key`
3. Restart backend

### 3. Groq (Fast Inference)

**Pros:**
- ✅ Extremely fast (< 1 second)
- ✅ Free tier available
- ✅ High quality models
- ✅ Good for development

**Cons:**
- ❌ Requires API key
- ❌ Rate limits on free tier
- ❌ Limited model selection

**Available Models:**
- `llama3-8b-8192` - Fast Llama 3 8B
- `llama3-70b-8192` - Fast Llama 3 70B
- `mixtral-8x7b-32768` - Mixtral MoE
- `gemma-7b-it` - Google Gemma

**Setup:**
1. Get API key from https://console.groq.com/
2. Add to `backend/.env`: `GROQ_API_KEY=your_key`
3. Restart backend

### 4. Anthropic (Claude)

**Pros:**
- ✅ High quality responses
- ✅ Good reasoning abilities
- ✅ Long context windows
- ✅ Safe and helpful

**Cons:**
- ❌ Requires API key
- ❌ More expensive
- ❌ Slower than Groq

**Available Models:**
- `claude-3-haiku-20240307` - Fast and affordable
- `claude-3-sonnet-20240229` - Balanced performance

**Setup:**
1. Get API key from https://console.anthropic.com/
2. Add to `backend/.env`: `ANTHROPIC_API_KEY=your_key`
3. Restart backend

## Database Schema

### Message Collection

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  role: String,                     // "user" or "ai"
  content: String,                  // Message text (max 10000 chars)
  provider: String,                 // "ollama", "openrouter", "groq", "anthropic"
  model: String,                    // Model name (e.g., "llama3")
  sessionId: String,                // Session identifier (default: "default")
  metadata: {
    responseTime: Number,           // AI response time in milliseconds
    tokenCount: Number,             // Token count (if available)
    error: String                   // Error message (if failed)
  },
  createdAt: Date,                  // Auto-generated timestamp
  updatedAt: Date                   // Auto-updated timestamp
}
```

### Indexes

```javascript
// Compound index for efficient session queries
{ sessionId: 1, createdAt: -1 }

// Index for sorting by creation time
{ createdAt: -1 }
```

### Static Methods

**getChatHistory(sessionId, limit)**
```javascript
// Get messages for a session, sorted by newest first
const messages = await Message.getChatHistory('default', 50);
```

**clearHistory(sessionId)**
```javascript
// Delete all messages for a session
const result = await Message.clearHistory('default');
console.log(`Deleted ${result.deletedCount} messages`);
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

**A. Using Docker:**
```bash
# Check if MongoDB container is running
docker ps

# If not running, start it
docker-compose up -d

# Check logs
docker-compose logs mongodb
```

**B. Using local MongoDB:**
```bash
# Start MongoDB
mongod

# Or as a service (Linux)
sudo systemctl start mongod

# Or as a service (Mac)
brew services start mongodb-community
```

**C. Check connection string:**
```env
# In backend/.env
MONGODB_URI=mongodb://localhost:27017/mini-chat-ollama
```

#### 2. Ollama Not Responding

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solutions:**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve

# In another terminal, verify models
ollama list

# If no models, pull one
ollama pull llama3

# Check Ollama logs
# Look for errors in the terminal where you ran 'ollama serve'
```

#### 3. Frontend Can't Connect to Backend

**Error:**
```
Network Error
Failed to fetch
```

**Solutions:**

**A. Check backend is running:**
```bash
# Should return {"status":"OK"}
curl http://localhost:5000/health
```

**B. Check frontend env:**
```env
# In frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**C. Check CORS settings:**
```env
# In backend/.env
CORS_ORIGIN=http://localhost:3000
```

**D. Restart both servers:**
```bash
# Stop both (Ctrl+C)
# Start backend first
cd backend && npm run dev

# Then start frontend
cd frontend && npm run dev
```

#### 4. Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

**A. Find and kill the process:**
```bash
# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**B. Use a different port:**
```env
# In backend/.env
PORT=5001

# Update frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

#### 5. API Key Not Working

**Error:**
```
401 Unauthorized
Invalid API key
```

**Solutions:**

**A. Verify API key:**
- Check for extra spaces
- Ensure key is valid and active
- Check key hasn't expired

**B. Restart backend:**
```bash
# Environment variables are loaded on startup
cd backend
npm run dev
```

**C. Check provider status:**
```bash
# Test the endpoint
curl http://localhost:5000/api/chat/providers
```

#### 6. Messages Not Persisting

**Error:**
Messages disappear after page reload

**Solutions:**

**A. Check MongoDB connection:**
```bash
# Should show messages
mongosh mini-chat-ollama
db.messages.find()
```

**B. Check browser console:**
- Look for API errors
- Verify requests are succeeding

**C. Check network tab:**
- Verify POST to `/api/chat/message` returns 200
- Verify GET to `/api/chat/history` returns messages

## Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] Application loads without errors
- [ ] Can send a message
- [ ] AI responds to message
- [ ] Messages display correctly (user vs AI styling)
- [ ] Loading indicator shows during AI processing
- [ ] Character counter updates as you type
- [ ] Character limit (500) is enforced
- [ ] Response time displays for AI messages
- [ ] Auto-scroll works when new messages arrive

#### Provider Switching
- [ ] Can switch between providers
- [ ] Model dropdown updates when provider changes
- [ ] Can send messages with different providers
- [ ] Provider availability detection works

#### Data Persistence
- [ ] Messages persist after page reload
- [ ] Messages load on initial page load
- [ ] Clear chat button works
- [ ] Confirmation dialog shows before clearing

#### Error Handling
- [ ] Error message shows if backend is down
- [ ] Error message shows if Ollama is not running
- [ ] Error message shows for invalid API keys
- [ ] Error message shows for network failures
- [ ] Empty message cannot be sent

### API Testing with curl

**Test health endpoint:**
```bash
curl http://localhost:5000/health
```

**Test get providers:**
```bash
curl http://localhost:5000/api/chat/providers
```

**Test send message:**
```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello!",
    "provider": "ollama",
    "model": "llama3",
    "sessionId": "test"
  }'
```

**Test get history:**
```bash
curl "http://localhost:5000/api/chat/history?sessionId=test"
```

**Test clear chat:**
```bash
curl -X POST http://localhost:5000/api/chat/clear \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test"}'
```

## Screenshots

### Main Chat Interface
```
┌─────────────────────────────────────────────────────────┐
│  🤖 Mini Chat Ollama                                    │
│  Provider: [Ollama ▼]  Model: [llama3 ▼]  [Clear Chat] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 You                                                 │
│  ┌─────────────────────────────────────────────────┐   │
│  │ What is the capital of France?                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                                      🤖 AI (llama3)     │
│                  ┌─────────────────────────────────┐    │
│                  │ The capital of France is Paris. │    │
│                  │ Response time: 2.3s             │    │
│                  └─────────────────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Type your message...                          [Send]   │
│  0/500                                                  │
└─────────────────────────────────────────────────────────┘
```

### Loading State
```
│                                      🤖 AI (llama3)     │
│                  ┌─────────────────────────────────┐    │
│                  │ ● ● ●                           │    │
│                  │ Thinking...                     │    │
│                  └─────────────────────────────────┘    │
```

### Error State
```
├─────────────────────────────────────────────────────────┤
│  ⚠️ Error: Failed to connect to Ollama. Make sure     │
│  Ollama is running with 'ollama serve'                 │
├─────────────────────────────────────────────────────────┤
```

## Future Enhancements

See [CHANGELOG.md](CHANGELOG.md) for the complete roadmap. Key planned features:

### High Priority
- **User Authentication** - Login/register system
- **Multiple Chat Sessions** - Create and manage multiple conversations
- **Streaming Responses** - Real-time token-by-token responses
- **Export Chat History** - Download conversations as JSON/PDF
- **Custom System Prompts** - Define AI behavior per session

### Medium Priority
- **Voice Input** - Speech-to-text integration
- **Image Generation** - Integrate DALL-E or Stable Diffusion
- **Dark/Light Theme** - User preference toggle
- **Rate Limiting** - Prevent API abuse
- **API Key Management UI** - Manage keys in the app

### Low Priority
- **Mobile App** - React Native version
- **Analytics Dashboard** - Usage statistics
- **Performance Monitoring** - APM integration
- **CI/CD Pipeline** - Automated testing and deployment
- **Unit Tests** - Jest + React Testing Library

## Development Notes

### Design Decisions

**Why Express.js?**
- Lightweight and flexible
- Large ecosystem of middleware
- Easy to understand and maintain
- Perfect for RESTful APIs

**Why Next.js 14?**
- Server-side rendering capabilities
- App Router for modern routing
- Built-in optimization
- Great developer experience

**Why MongoDB?**
- Flexible schema for evolving features
- Easy to scale horizontally
- Native JSON support
- Great for chat applications

**Why Multiple Providers?**
- Demonstrates API integration skills
- Provides flexibility for users
- Shows understanding of different AI services
- Future-proofs the application

### Code Organization

- **Separation of Concerns**: Routes, controllers, models are separate
- **DRY Principle**: Reusable functions for each provider
- **Error Handling**: Try-catch blocks everywhere
- **Environment Config**: All secrets in .env files
- **Logging**: Morgan for HTTP requests, console for important events

### Performance Considerations

- **Database Indexes**: Optimized queries for chat history
- **Connection Pooling**: MongoDB connection reuse
- **Lazy Loading**: Frontend loads messages on demand
- **Debouncing**: Could be added for input validation
- **Caching**: Could be added for provider availability

### Security Considerations

- **Environment Variables**: API keys never in code
- **Input Validation**: Message length and required fields
- **CORS**: Restricted to frontend origin
- **MongoDB Injection**: Mongoose sanitizes inputs
- **Rate Limiting**: Should be added for production

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Code of conduct
- How to report bugs
- How to suggest features
- Pull request process
- Coding standards
- Development setup

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## Author & Acknowledgments

### Author

Created by **[Your Name]** as a technical interview project.

- **GitHub**: [Your GitHub Profile]
- **LinkedIn**: [Your LinkedIn]
- **Email**: [Your Email]

### Time Investment

- **Recommended**: 2-3 hours
- **Actual**: 4-5 hours
- **Breakdown**:
  - Planning & Design: 30 minutes
  - Backend Development: 1.5 hours
  - Frontend Development: 1.5 hours
  - Documentation: 1 hour
  - Testing & Debugging: 30 minutes

## Author & Acknowledgments

### Author

**Kitthiphat** - Project Creator & Developer

- 📧 Contact: Available via project repository
- 🌐 Project: Mini Chat Ollama
- 📅 Created: December 2024

### Acknowledgments

**Technologies:**
- [Ollama](https://ollama.ai/) - Local AI inference
- [OpenRouter](https://openrouter.ai/) - Multi-model API gateway
- [Groq](https://groq.com/) - Fast AI inference
- [Anthropic](https://anthropic.com/) - Claude AI models
- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

**Inspiration:**
- ChatGPT interface design
- Claude.ai conversation flow
- Modern chat application UX patterns

**Learning Resources:**
- Next.js documentation
- Express.js guides
- MongoDB University
- Ollama documentation

---

**Made with ❤️ by Kitthiphat | December 2024**

For quick setup, see [QUICKSTART.md](QUICKSTART.md)

For project overview, see [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## ⚠️ Hardware Limitations & Hybrid Mode

**Note for Local Deployment:**
This project relies on AI models that require significant computational power.
- **Without Dedicated GPU**: Running Ollama local models (like Llama 3) on CPU-only machines (e.g., MiniPC, standard laptops) will be **extremely slow** (~20-30s per response).
- **Hybrid Solution**: For low-spec hardware, we highly recommend switching to **Cloud Providers** (Groq, OpenRouter) which deliver near-instant responses (<1s) without burdening your local machine.

## 🐧 Linux Migration Log (Jan 2026)

This project has been migrated from Windows to Linux. Key changes include:
- **Environment**: Updated `backend/.env` to support multiple CORS origins.
- **Frontend**: Created `.env.production` to point to public domain APIs.
- **Tunneling**: Reconfigured Cloudflare Tunnel ID and credentials for Linux paths.
- **Database**: Restored user data from JSON backup.
- **AI**: Switched default provider to **Groq** for performance optimization on non-GPU hardware.


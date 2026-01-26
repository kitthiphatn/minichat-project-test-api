# 📦 Getting Started with Mini Chat Ollama

## 🎯 What is this project?

**Mini Chat Ollama** is a full-stack AI chat application that:
- 💬 Chat with AI like chatting with a friend
- 🔄 Supports 4 AI providers (Ollama, Groq, OpenRouter, Anthropic)
- 💾 Saves conversation history in MongoDB
- 🎨 Beautiful UI, easy to use

---

## ⚡ Get Started in 3 Steps

### Step 1: Install Prerequisites (10 minutes)

**Required:**
1. **Node.js** v18+ → https://nodejs.org/
2. **MongoDB** → Choose one:
   - MongoDB Compass (recommended) → https://www.mongodb.com/try/download/compass
   - Or Docker Desktop → https://www.docker.com/

### Step 2: Install Project (5 minutes)

Open Command Prompt in project folder:

```bash
# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install

# Create .env files
cd ../backend
copy .env.example .env

cd ../frontend
copy .env.local.example .env.local
```

### Step 3: Choose AI Provider

**Option 1: Groq (Recommended - Free, No Installation)**
1. Sign up at https://console.groq.com/ (free)
2. Copy API Key
3. Open `backend\.env` add: `GROQ_API_KEY=gsk_xxxxxxxx`
4. Done!

**Option 2: Ollama (Free but requires installation)**
1. Download https://ollama.ai/
2. Install and run `ollama serve`
3. Download model: `ollama pull llama3`

---

## 🚀 How to Run

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Open browser:** http://localhost:3000

---

## 💬 How to Use

1. Select Provider (Groq or Ollama)
2. Select Model
3. Type message
4. Click Send
5. Wait for AI response!

---

## 📚 Read More

- **[Complete Setup Guide](02-SETUP-GUIDE-EN.md)** - Troubleshooting included
- **[API Integration Guide](03-API-GUIDE-EN.md)** - Gemini, Claude, GPT
- **[Quick Start](04-QUICKSTART-EN.md)** - Short version

---

## 🆘 Need Help?

Read the [Setup Guide](02-SETUP-GUIDE-EN.md) for complete troubleshooting!

---

**Created by:** Kitthiphat | **Date:** December 9, 2024

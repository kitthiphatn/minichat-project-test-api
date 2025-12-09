# 🚀 Setup Guide - Mini Chat Ollama

## 📋 Prerequisites

### Required
- Node.js v18+ → https://nodejs.org/
- MongoDB (choose one):
  - MongoDB Compass → https://www.mongodb.com/try/download/compass
  - Docker Desktop → https://www.docker.com/

### Optional
- Ollama → https://ollama.ai/ (for free local AI)
- API Keys (for cloud AI)

---

## ⚡ Quick Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Create .env files
cd ../backend && copy .env.example .env
cd ../frontend && copy .env.local.example .env.local

# 3. Start MongoDB (if using Docker)
cd ..
docker-compose up -d

# 4. Run Backend (Terminal 1)
cd backend && npm run dev

# 5. Run Frontend (Terminal 2)
cd frontend && npm run dev
```

Open browser: http://localhost:3000

---

## 🎯 Choose AI Provider

### Option 1: Groq (Recommended)

**Pros:** Free, no installation, fast

**Steps:**
1. Sign up https://console.groq.com/
2. Copy API Key
3. Open `backend\.env`
4. Add: `GROQ_API_KEY=gsk_xxxxxxxx`
5. Restart Backend

### Option 2: Ollama

**Pros:** 100% free, works offline

**Steps:**
1. Download https://ollama.ai/
2. Install
3. Terminal: `ollama serve`
4. New terminal: `ollama pull llama3`

---

## 🔧 Troubleshooting

### Port 5000 in use
```bash
netstat -ano | findstr :5000
taskkill /PID <PID number> /F
```

### MongoDB not connecting
- Open MongoDB Compass
- Or `docker-compose up -d`

### Ollama not responding
```bash
ollama serve
ollama pull llama3
```

### Groq not working
- Check API Key in `.env`
- No `#` in front
- Restart Backend

---

## 📦 Prepare for Zip

### Delete before zipping
```bash
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules
rmdir /s /q frontend\.next
del backend\.env
del frontend\.env.local
```

### Keep
- ✅ All code
- ✅ `.env.example` files
- ✅ All documentation

---

**Read next:** [API Integration Guide](03-API-GUIDE-EN.md)

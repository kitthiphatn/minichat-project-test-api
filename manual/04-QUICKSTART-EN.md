# ⚡ 5-Minute Quick Start

## Quick Steps

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Create .env Files
```bash
cd ../backend && copy .env.example .env
cd ../frontend && copy .env.local.example .env.local
```

### 3. Setup Groq (Free)
1. Sign up https://console.groq.com/
2. Copy API Key
3. Open `backend\.env`
4. Add: `GROQ_API_KEY=gsk_xxxxxxxx`

### 4. Run
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### 5. Open Browser
http://localhost:3000

---

## Done!

Select Provider: **Groq**  
Select Model: **llama3-8b-8192**  
Start chatting!

---

**Need help?** Read [Setup Guide](02-SETUP-GUIDE-EN.md)

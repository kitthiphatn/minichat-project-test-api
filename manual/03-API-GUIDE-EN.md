# 🔌 API Integration Guide

## 📊 API Comparison

| API | Price | Speed | Setup |
|-----|-------|-------|-------|
| **Groq** | Free | ⚡⚡⚡ | Easy |
| **OpenRouter** | Cheap | ⚡⚡ | Easy |
| **Anthropic** | Medium | ⚡⚡ | Easy |
| **Ollama** | Free | ⚡ | Hard |

---

## 1️⃣ Groq (Recommended!)

### Sign Up
1. https://console.groq.com/
2. Sign Up (use Google Account)
3. API Keys → Create API Key
4. Copy (starts with `gsk_`)

### Setup
```env
# backend/.env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Models
- `llama3-8b-8192` - Fastest ⭐⭐⭐
- `llama3-70b-8192` - High quality ⭐⭐⭐⭐
- `mixtral-8x7b-32768` - Balanced ⭐⭐⭐⭐

---

## 2️⃣ OpenRouter (Gemini, Claude, GPT)

### Sign Up
1. https://openrouter.ai/
2. Sign In (Google/GitHub)
3. Keys → Create Key
4. Copy (starts with `sk-or-`)

### Add Credits
- Credits → Add Credits
- Minimum $5

### Setup
```env
# backend/.env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Recommended Models

**Gemini**
```
google/gemini-pro
Price: $0.000125/1K tokens (very cheap!)
```

**Claude**
```
anthropic/claude-3-haiku
Price: $0.00025/1K tokens
```

**GPT**
```
openai/gpt-3.5-turbo
Price: $0.0005/1K tokens
```

### Add More Models

Edit `backend/src/controllers/chatController.js`:

```javascript
openrouter: {
  models: [
    'google/gemini-pro',           // Gemini
    'anthropic/claude-3-haiku',    // Claude
    'openai/gpt-3.5-turbo',       // GPT
    'meta-llama/llama-3-8b-instruct', // Llama
  ],
}
```

---

## 3️⃣ Anthropic (Claude)

### Sign Up
1. https://console.anthropic.com/
2. Sign Up
3. Add credits ($5 minimum)
4. API Keys → Create Key
5. Copy (starts with `sk-ant-`)

### Setup
```env
# backend/.env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Models
- `claude-3-haiku` - Cheap ⭐⭐⭐
- `claude-3-sonnet` - Good ⭐⭐⭐⭐
- `claude-3-opus` - Excellent ⭐⭐⭐⭐⭐

---

## 🎯 Recommendations

**Demo/Presentation** → Groq  
**Development** → Groq or Ollama  
**Production** → OpenRouter  
**Best Quality** → Claude Opus  

---

## 🔧 Troubleshooting

### API Key not working
- Check no `#` in front
- Restart Backend
- Check credits remaining

### Rate Limit
- Wait a moment
- Switch to another provider

---

**Created by:** Kitthiphat | **Date:** December 9, 2024

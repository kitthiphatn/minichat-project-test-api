# 🔌 คู่มือเชื่อม API

## 📊 เปรียบเทียบ API

| API | ราคา | ความเร็ว | ติดตั้ง |
|-----|------|----------|---------|
| **Groq** | ฟรี | ⚡⚡⚡ | ง่าย |
| **OpenRouter** | ถูก | ⚡⚡ | ง่าย |
| **Anthropic** | ปานกลาง | ⚡⚡ | ง่าย |
| **Ollama** | ฟรี | ⚡ | ยาก |

---

## 1️⃣ Groq (แนะนำ!)

### สมัคร
1. https://console.groq.com/
2. Sign Up (ใช้ Google Account)
3. API Keys → Create API Key
4. คัดลอก (เริ่มต้น `gsk_`)

### ตั้งค่า
```env
# backend/.env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Models
- `llama3-8b-8192` - เร็วที่สุด ⭐⭐⭐
- `llama3-70b-8192` - คุณภาพสูง ⭐⭐⭐⭐
- `mixtral-8x7b-32768` - สมดุล ⭐⭐⭐⭐

---

## 2️⃣ OpenRouter (Gemini, Claude, GPT)

### สมัคร
1. https://openrouter.ai/
2. Sign In (Google/GitHub)
3. Keys → Create Key
4. คัดลอก (เริ่มต้น `sk-or-`)

### เติมเงิน
- Credits → Add Credits
- ขั้นต่ำ $5

### ตั้งค่า
```env
# backend/.env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Models ที่แนะนำ

**Gemini**
```
google/gemini-pro
ราคา: $0.000125/1K tokens (ถูกมาก!)
```

**Claude**
```
anthropic/claude-3-haiku
ราคา: $0.00025/1K tokens
```

**GPT**
```
openai/gpt-3.5-turbo
ราคา: $0.0005/1K tokens
```

### เพิ่ม Models

แก้ `backend/src/controllers/chatController.js`:

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

### สมัคร
1. https://console.anthropic.com/
2. Sign Up
3. เติมเงิน ($5 ขั้นต่ำ)
4. API Keys → Create Key
5. คัดลอก (เริ่มต้น `sk-ant-`)

### ตั้งค่า
```env
# backend/.env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Models
- `claude-3-haiku` - ถูก ⭐⭐⭐
- `claude-3-sonnet` - ดี ⭐⭐⭐⭐
- `claude-3-opus` - ดีเยี่ยม ⭐⭐⭐⭐⭐

---

## 🎯 คำแนะนำ

**Demo/นำเสนอ** → Groq  
**Development** → Groq หรือ Ollama  
**Production** → OpenRouter  
**คุณภาพสูงสุด** → Claude Opus  

---

## 🔧 แก้ปัญหา

### API Key ไม่ทำงาน
- ตรวจสอบไม่มี `#` ข้างหน้า
- รีสตาร์ท Backend
- ตรวจสอบเครดิตเหลืออยู่

### Rate Limit
- รอสักครู่
- เปลี่ยน provider อื่น

---

**สร้างโดย:** Kitthiphat | **วันที่:** 9 ธันวาคม 2024

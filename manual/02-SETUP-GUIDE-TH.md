# 🚀 คู่มือติดตั้ง Mini Chat Ollama

## 📋 สิ่งที่ต้องเตรียม

### จำเป็น
- Node.js v18+ → https://nodejs.org/
- MongoDB (เลือก 1):
  - MongoDB Compass → https://www.mongodb.com/try/download/compass
  - Docker Desktop → https://www.docker.com/

### ไม่จำเป็น (เลือกตามต้องการ)
- Ollama → https://ollama.ai/ (สำหรับ AI ฟรี บนเครื่อง)
- API Keys (สำหรับ AI แบบคลาวด์)

---

## ⚡ ติดตั้งแบบเร็ว

```bash
# 1. ติดตั้ง dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. สร้างไฟล์ .env
cd ../backend && copy .env.example .env
cd ../frontend && copy .env.local.example .env.local

# 3. เปิด MongoDB (ถ้าใช้ Docker)
cd ..
docker-compose up -d

# 4. รัน Backend (Terminal 1)
cd backend && npm run dev

# 5. รัน Frontend (Terminal 2)
cd frontend && npm run dev
```

เปิดเว็บ: http://localhost:3000

---

## 🎯 เลือกวิธีใช้ AI

### วิธีที่ 1: Groq (แนะนำ)

**ข้อดี:** ฟรี, ไม่ต้องติดตั้ง, ตอบเร็ว

**ขั้นตอน:**
1. สมัคร https://console.groq.com/
2. คัดลอก API Key
3. เปิด `backend\.env`
4. เพิ่ม: `GROQ_API_KEY=gsk_xxxxxxxx`
5. รีสตาร์ท Backend

### วิธีที่ 2: Ollama

**ข้อดี:** ฟรี 100%, ไม่ต้องอินเทอร์เน็ต

**ขั้นตอน:**
1. ดาวน์โหลด https://ollama.ai/
2. ติดตั้ง
3. เปิด Terminal: `ollama serve`
4. Terminal ใหม่: `ollama pull llama3`

---

## 🔧 แก้ปัญหา

### Port 5000 ถูกใช้แล้ว
```bash
netstat -ano | findstr :5000
taskkill /PID <เลข PID> /F
```

### MongoDB ไม่เชื่อมต่อ
- เปิด MongoDB Compass
- หรือ `docker-compose up -d`

### Ollama ไม่ตอบ
```bash
ollama serve
ollama pull llama3
```

### Groq ไม่ทำงาน
- ตรวจสอบ API Key ใน `.env`
- ต้องไม่มี `#` ข้างหน้า
- รีสตาร์ท Backend

---

## 📦 เตรียม Zip ส่ง

### ลบก่อน Zip
```bash
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules
rmdir /s /q frontend\.next
del backend\.env
del frontend\.env.local
```

### เก็บไว้
- ✅ โค้ดทั้งหมด
- ✅ `.env.example` files
- ✅ เอกสารทั้งหมด

---

**อ่านต่อ:** [คู่มือเชื่อม API](03-API-GUIDE-TH.md)

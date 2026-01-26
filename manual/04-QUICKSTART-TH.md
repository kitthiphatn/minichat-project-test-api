# ⚡ เริ่มใช้งานใน 5 นาที

## ขั้นตอนย่อ

### 1. ติดตั้ง Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. สร้างไฟล์ .env
```bash
cd ../backend && copy .env.example .env
cd ../frontend && copy .env.local.example .env.local
```

### 3. ตั้งค่า Groq (ฟรี)
1. สมัคร https://console.groq.com/
2. คัดลอก API Key
3. เปิด `backend\.env`
4. ใส่: `GROQ_API_KEY=gsk_xxxxxxxx`

### 4. รัน
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### 5. เปิดเว็บ
http://localhost:3000

---

## เสร็จแล้ว!

เลือก Provider: **Groq**  
เลือก Model: **llama3-8b-8192**  
เริ่มแชท!

---

**ติดปัญหา?** อ่าน [คู่มือติดตั้ง](02-SETUP-GUIDE-TH.md)

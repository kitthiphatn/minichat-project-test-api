# 🚀 วิธีซ่อน IP ด้วย ngrok (ทดสอบในบ้าน)

## ขั้นตอนที่ 1: ติดตั้ง ngrok

### วิธีที่ 1: ใช้ winget (แนะนำ)
```powershell
winget install --id=Ngrok.Ngrok -e
```

### วิธีที่ 2: ดาวน์โหลดเอง
1. ไปที่ https://ngrok.com/download
2. ดาวน์โหลด Windows (64-bit)
3. แตกไฟล์ zip
4. ย้าย `ngrok.exe` ไปที่ `C:\Windows\System32\`

---

## ขั้นตอนที่ 2: สมัครและตั้งค่า

### 1. สมัคร ngrok (ฟรี)
1. ไปที่ https://dashboard.ngrok.com/signup
2. สมัครด้วย Email หรือ GitHub
3. ยืนยัน Email

### 2. Copy Authtoken
1. ไปที่ https://dashboard.ngrok.com/get-started/your-authtoken
2. คัดลอก Authtoken

### 3. ตั้งค่า Authtoken
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

---

## ขั้นตอนที่ 3: รัน ngrok

### เปิด 3 Terminals:

**Terminal 1 - Backend (เหมือนเดิม):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (เหมือนเดิม):**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ngrok Frontend:**
```bash
ngrok http 3000
```

**Terminal 4 - ngrok Backend:**
```bash
ngrok http 5000
```

---

## ขั้นตอนที่ 4: คัดลอก URLs

### จาก Terminal 3 (Frontend ngrok):
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```
→ คัดลอก `https://abc123.ngrok-free.app`

### จาก Terminal 4 (Backend ngrok):
```
Forwarding  https://xyz789.ngrok-free.app -> http://localhost:5000
```
→ คัดลอก `https://xyz789.ngrok-free.app`

---

## ขั้นตอนที่ 5: อัปเดต Frontend

### แก้ไข `frontend\.env.local`:
```
NEXT_PUBLIC_API_URL=https://xyz789.ngrok-free.app/api
```

### Restart Frontend:
```bash
# กด Ctrl+C ใน Terminal 2
# รันใหม่:
npm run dev
```

---

## ขั้นตอนที่ 6: ทดสอบ

### เปิด Browser:
```
https://abc123.ngrok-free.app
```

**ควรเห็น:**
- หน้าแชทโหลดขึ้นมา
- มี Providers (Ollama, Groq, etc.)
- สามารถส่งข้อความได้

**ทดสอบจากมือถือ:**
- เปิด browser ในมือถือ
- ไปที่ URL เดียวกัน
- ใช้งานได้เหมือนกัน!

---

## 💡 เคล็ดลับ

### 1. URL เปลี่ยนทุกครั้ง
แบบฟรี URL จะเปลี่ยนทุกครั้งที่รัน ngrok ใหม่

**แก้ไข:** Upgrade เป็น ngrok Pro ($8/เดือน) จะได้ URL ถาวร

### 2. หน้า Warning
ngrok ฟรีจะมีหน้า warning ก่อนเข้าเว็บ

**แก้ไข:** คลิก "Visit Site" เพื่อข้ามไป

### 3. ใช้ ngrok config
สร้างไฟล์ `ngrok.yml` เพื่อรันหลาย tunnel พร้อมกัน:

**สร้างไฟล์:** `C:\Users\Marke\.ngrok2\ngrok.yml`
```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN_HERE
tunnels:
  frontend:
    proto: http
    addr: 3000
  backend:
    proto: http
    addr: 5000
```

**รัน:**
```bash
ngrok start --all
```

---

## 🔍 การแก้ปัญหา

### ปัญหา: ngrok ไม่ทำงาน
```bash
# ตรวจสอบว่าติดตั้งแล้ว
ngrok version

# ตรวจสอบ authtoken
ngrok config check
```

### ปัญหา: Frontend เชื่อมต่อ Backend ไม่ได้
1. ตรวจสอบ `.env.local` ว่าใช้ ngrok URL ถูกต้อง
2. Restart Frontend
3. Clear browser cache

### ปัญหา: Too many connections
แบบฟรีจำกัด 40 connections/minute

**แก้ไข:** Upgrade หรือรอ 1 นาที

---

## ✅ สรุป

**คำสั่งที่ต้องรัน:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Terminal 3
ngrok http 3000

# Terminal 4
ngrok http 5000
```

**อย่าลืม:**
1. อัปเดต `frontend\.env.local` ด้วย Backend ngrok URL
2. Restart Frontend หลังแก้ `.env.local`
3. แชร์ Frontend ngrok URL ให้คนอื่นเข้าได้

**URL ที่ได้:**
- Frontend: `https://abc123.ngrok-free.app` (แชร์ URL นี้)
- Backend: `https://xyz789.ngrok-free.app` (ใช้ภายใน)

---

**หมายเหตุ:** URL จะเปลี่ยนทุกครั้งที่ปิดเปิด ngrok ใหม่

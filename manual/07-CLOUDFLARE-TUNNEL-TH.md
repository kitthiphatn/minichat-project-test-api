# 🌐 วิธีผูกโดเมนด้วย Cloudflare Tunnel (ฟรี)

## ภาพรวม

Cloudflare Tunnel ช่วยให้คุณ:
- ✅ ซ่อน IP address ของเซิร์ฟเวอร์
- ✅ ผูกโดเมนฟรี
- ✅ HTTPS อัตโนมัติ
- ✅ ใช้กับ Ollama ได้ (รันบนคอม)
- ✅ ไม่ต้องเปิด port ใน firewall

---

## ขั้นตอนที่ 1: เตรียมโดเมน

### ถ้ายังไม่มีโดเมน:
1. ซื้อโดเมนจาก:
   - **Namecheap** - $8-12/ปี
   - **GoDaddy** - $10-15/ปี
   - **Cloudflare Registrar** - ราคาทุน (แนะนำ)

### ถ้ามีโดเมนแล้ว:
1. ไปที่ https://dash.cloudflare.com/
2. คลิก "Add a Site"
3. ใส่โดเมนของคุณ (เช่น `yourdomain.com`)
4. เลือก Free plan
5. คลิก "Continue"

### เปลี่ยน Nameservers:
Cloudflare จะให้ nameservers 2 ตัว:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

ไปที่ Domain Provider ของคุณและเปลี่ยน nameservers:
1. Login ที่ Namecheap/GoDaddy
2. ไปที่ Domain Management
3. เปลี่ยน Nameservers เป็นของ Cloudflare
4. รอ 5-30 นาที

---

## ขั้นตอนที่ 2: ติดตั้ง Cloudflared

### Windows:

**วิธีที่ 1: ดาวน์โหลดเอง (แนะนำ)**
1. ไปที่ https://github.com/cloudflare/cloudflared/releases
2. ดาวน์โหลด `cloudflared-windows-amd64.exe`
3. เปลี่ยนชื่อเป็น `cloudflared.exe`
4. ย้ายไปที่ `C:\Windows\System32\`

**วิธีที่ 2: ใช้ winget**
```powershell
winget install --id Cloudflare.cloudflared
```

**ทดสอบ:**
```bash
cloudflared --version
```

---

## ขั้นตอนที่ 3: Login Cloudflare

### 1. Login:
```bash
cloudflared tunnel login
```

Browser จะเปิดขึ้นมา:
1. เลือกโดเมนที่ต้องการใช้
2. คลิก "Authorize"
3. ปิด browser

**ไฟล์ cert จะถูกสร้างที่:**
```
C:\Users\Marke\.cloudflared\cert.pem
```

---

## ขั้นตอนที่ 4: สร้าง Tunnel

### 1. สร้าง Tunnel:
```bash
cloudflared tunnel create minichat
```

**ผลลัพธ์:**
```
Tunnel credentials written to C:\Users\Marke\.cloudflared\<TUNNEL-ID>.json
Created tunnel minichat with id <TUNNEL-ID>
```

→ **เก็บ TUNNEL-ID ไว้!**

### 2. ตรวจสอบ Tunnel:
```bash
cloudflared tunnel list
```

---

## ขั้นตอนที่ 5: สร้างไฟล์ Config

### สร้างไฟล์: `C:\Users\Marke\.cloudflared\config.yml`

**เปิด Notepad:**
```powershell
notepad C:\Users\Marke\.cloudflared\config.yml
```

**เนื้อหา:**
```yaml
tunnel: <TUNNEL-ID>
credentials-file: C:\Users\Marke\.cloudflared\<TUNNEL-ID>.json

ingress:
  # Frontend - หน้าหลัก
  - hostname: chat.yourdomain.com
    service: http://localhost:3000
  
  # Backend - API
  - hostname: api.yourdomain.com
    service: http://localhost:5000
  
  # Catch-all rule (จำเป็น)
  - service: http_status:404
```

**แทนที่:**
- `<TUNNEL-ID>` → Tunnel ID ที่ได้จากขั้นตอนที่ 4
- `yourdomain.com` → โดเมนจริงของคุณ

**บันทึกไฟล์**

---

## ขั้นตอนที่ 6: ตั้งค่า DNS

### วิธีที่ 1: ใช้คำสั่ง (แนะนำ)
```bash
cloudflared tunnel route dns minichat chat.yourdomain.com
cloudflared tunnel route dns minichat api.yourdomain.com
```

### วิธีที่ 2: ตั้งค่าเอง
1. ไปที่ https://dash.cloudflare.com/
2. เลือกโดเมน
3. ไปที่ DNS → Records
4. เพิ่ม CNAME records:

```
Type    Name    Target                              Proxy
CNAME   chat    <TUNNEL-ID>.cfargotunnel.com       Proxied
CNAME   api     <TUNNEL-ID>.cfargotunnel.com       Proxied
```

---

## ขั้นตอนที่ 7: อัปเดต Frontend Config

### แก้ไข `frontend\.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## ขั้นตอนที่ 8: รัน Tunnel

### เปิด 3 Terminals:

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

**Terminal 3 - Cloudflare Tunnel:**
```bash
cloudflared tunnel run minichat
```

**ผลลัพธ์:**
```
INF Connection registered connIndex=0 location=BKK
INF Connection registered connIndex=1 location=SIN
INF Connection registered connIndex=2 location=HKG
INF Connection registered connIndex=3 location=TPE
```

---

## ขั้นตอนที่ 9: ทดสอบ

### เปิด Browser:
```
https://chat.yourdomain.com
```

**ควรเห็น:**
- ✅ หน้าแชทโหลดขึ้นมา
- ✅ มี HTTPS (ล็อคสีเขียว)
- ✅ ไม่มี warning
- ✅ Providers และ Models แสดงปกติ

**ทดสอบจากมือถือ:**
- เปิด browser ในมือถือ (ไม่ต้องอยู่ WiFi เดียวกัน)
- ไปที่ `https://chat.yourdomain.com`
- ใช้งานได้จากทุกที่!

---

## 🚀 ตั้งค่าให้รันอัตโนมัติ (Windows)

### วิธีที่ 1: ใช้ Task Scheduler

**1. สร้าง Batch File:**

**สร้างไฟล์:** `C:\minichat\start-tunnel.bat`
```batch
@echo off
cd C:\Users\Marke\Desktop\minichat project
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 5
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5
start "Tunnel" cmd /k "cloudflared tunnel run minichat"
```

**2. สร้าง Task:**
1. เปิด Task Scheduler
2. Create Basic Task
3. Name: "Mini Chat Tunnel"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program: `C:\minichat\start-tunnel.bat`
7. Finish

### วิธีที่ 2: ใช้ Windows Service

**ติดตั้ง Tunnel เป็น Service:**
```powershell
cloudflared service install
```

**Start Service:**
```powershell
sc start cloudflared
```

**ตั้งค่าให้เริ่มอัตโนมัติ:**
```powershell
sc config cloudflared start=auto
```

---

## 💡 เคล็ดลับ

### 1. Multiple Tunnels
สามารถสร้างหลาย tunnel ได้:
```bash
cloudflared tunnel create minichat-dev
cloudflared tunnel create minichat-prod
```

### 2. Subdomain ไม่จำกัด
เพิ่ม subdomain ได้ฟรีไม่จำกัด:
```yaml
ingress:
  - hostname: chat.yourdomain.com
    service: http://localhost:3000
  - hostname: admin.yourdomain.com
    service: http://localhost:8080
  - hostname: api.yourdomain.com
    service: http://localhost:5000
```

### 3. Wildcard Subdomain
รองรับ wildcard:
```yaml
ingress:
  - hostname: "*.yourdomain.com"
    service: http://localhost:3000
```

### 4. ดู Logs
```bash
cloudflared tunnel info minichat
```

---

## 🔍 การแก้ปัญหา

### ปัญหา: Tunnel ไม่เชื่อมต่อ

**ตรวจสอบ:**
```bash
# ดูสถานะ tunnel
cloudflared tunnel list

# ทดสอบ config
cloudflared tunnel ingress validate

# ดู logs
cloudflared tunnel run minichat --loglevel debug
```

### ปัญหา: DNS ไม่ทำงาน

**ตรวจสอบ:**
```bash
# ตรวจสอบ DNS
nslookup chat.yourdomain.com

# ควรเห็น CNAME ชี้ไปที่ .cfargotunnel.com
```

**แก้ไข:**
1. ไปที่ Cloudflare Dashboard
2. DNS → Records
3. ตรวจสอบว่า Proxy status เป็น "Proxied" (สีส้ม)

### ปัญหา: Frontend เชื่อมต่อ Backend ไม่ได้

**ตรวจสอบ:**
1. `.env.local` ใช้ `https://api.yourdomain.com/api`
2. Backend รันอยู่ที่ port 5000
3. Tunnel config ถูกต้อง

### ปัญหา: Too Many Redirects

**แก้ไข:**
1. ไปที่ Cloudflare Dashboard
2. SSL/TLS → Overview
3. เปลี่ยนเป็น "Full" หรือ "Full (strict)"

### ปัญหา: Backend Port ไม่ตรงกับ Config

**อาการ:** Providers ไม่โหลด หรือ API ไม่ตอบ

**สาเหตุ:** Backend รันที่ port 5001 แต่ Cloudflare Tunnel config ยังชี้ไปที่ port 5000

**วิธีแก้ไข:**

#### 1. แก้ไข Cloudflare Tunnel Config

เปิดไฟล์ config:
```powershell
notepad C:\Users\Marke\.cloudflared\config.yml
```

แก้ไขให้ port ตรงกับ Backend:
```yaml
tunnel: d26fba95-f796-45e3-96dd-7e0b3bbd867a
credentials-file: C:\Users\Marke\.cloudflared\d26fba95-f796-45e3-96dd-7e0b3bbd867a.json

ingress:
  # Minichat Frontend
  - hostname: chat.clubfivem.com
    service: http://localhost:3000
  
  # Minichat Backend API (ตรวจสอบ port)
  - hostname: api.clubfivem.com
    service: http://localhost:5001  # ต้องตรงกับ Backend
  
  # Catch-all rule (required)
  - service: http_status:404
```

บันทึกไฟล์ (Ctrl+S)

#### 2. Restart Cloudflare Tunnel

1. ปิด Cloudflare Tunnel ที่กำลังรันอยู่ (กด Ctrl+C ใน terminal)
2. รันใหม่:
```bash
cloudflared tunnel run minichat
```

#### 3. ทดสอบ

เปิด browser ไปที่:
```
https://chat.clubfivem.com
```

ควรเห็น providers โหลดขึ้นมาปกติ

#### 4. ตรวจสอบ Backend Port

```powershell
# ดูว่า backend รันอยู่ที่ port ไหน
netstat -ano | findstr :5001
```

#### 5. ตรวจสอบ Tunnel Config

```powershell
# ตรวจสอบว่า config ถูกต้อง
cloudflared tunnel ingress validate
```

---

## 🔒 ความปลอดภัย

### 1. Enable Cloudflare Access (ฟรี)
ป้องกันไม่ให้คนอื่นเข้าถึง:
1. ไปที่ Cloudflare Dashboard
2. Zero Trust → Access → Applications
3. Add an application
4. เลือก Self-hosted
5. ตั้งค่า authentication (Email OTP, Google, etc.)

### 2. Rate Limiting
จำกัดจำนวน requests:
1. ไปที่ Security → WAF
2. Create rate limiting rule
3. ตั้งค่าตามต้องการ

### 3. Firewall Rules
บล็อก IP หรือประเทศ:
1. ไปที่ Security → WAF
2. Create firewall rule
3. ตั้งค่าเงื่อนไข

---

## ✅ สรุป

**ข้อดี Cloudflare Tunnel:**
- ✅ ฟรี
- ✅ ซ่อน IP
- ✅ HTTPS อัตโนมัติ
- ✅ ใช้กับ Ollama ได้
- ✅ ไม่ต้องเปิด port
- ✅ DDoS protection ฟรี

**คำสั่งสำคัญ:**
```bash
# สร้าง tunnel
cloudflared tunnel create minichat

# ตั้งค่า DNS
cloudflared tunnel route dns minichat chat.yourdomain.com
cloudflared tunnel route dns minichat api.yourdomain.com

# รัน tunnel
cloudflared tunnel run minichat

# ดูสถานะ
cloudflared tunnel list
cloudflared tunnel info minichat
```

**URL ที่ได้:**
- Frontend: `https://chat.yourdomain.com`
- Backend: `https://api.yourdomain.com`

---

## 📚 เอกสารเพิ่มเติม

- **Official Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Dashboard:** https://dash.cloudflare.com/
- **Community:** https://community.cloudflare.com/

---

**สร้างโดย:** Kitthiphat | **วันที่:** 9 ธันวาคม 2024

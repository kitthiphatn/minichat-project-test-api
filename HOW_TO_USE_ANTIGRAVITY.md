# 📖 วิธีใช้ Prompt กับ Claude Sonnet 4.5 ใน Antigravity

## 🎯 สิ่งที่ต้องเตรียม

1. ✅ Google AI Studio (Antigravity) account - [aistudio.google.com](https://aistudio.google.com/)
2. ✅ ไฟล์ `PROMPT_FOR_CLAUDE.md` ที่สร้างมาแล้ว
3. ✅ Text editor สำหรับ copy/paste โค้ด

---

## 🚀 ขั้นตอนการใช้งาน

### ขั้นที่ 1: เข้าสู่ Antigravity
1. เปิด [https://aistudio.google.com/](https://aistudio.google.com/)
2. Login ด้วย Google account
3. คลิก **"Create new"** หรือ **"New prompt"**

### ขั้นที่ 2: เลือก Model
1. ที่ด้านบนขวา คลิก dropdown เลือก model
2. เลือก **"Claude Sonnet 4.5"** (หรือ Claude Sonnet 4 ถ้าไม่มี 4.5)
3. ตั้งค่า:
   - Temperature: **0.7** (สำหรับความสร้างสรรค์)
   - Max tokens: **8192** (maximum)
   - Stop sequences: ปล่อยว่าง

### ขั้นที่ 3: วาง Prompt
1. เปิดไฟล์ `PROMPT_FOR_CLAUDE.md`
2. **Copy ทั้งหมด** (Ctrl+A → Ctrl+C)
3. **Paste** ลงใน prompt box ของ Antigravity (Ctrl+V)

### ขั้นที่ 4: Run และรอผลลัพธ์
1. คลิกปุ่ม **"Run"** หรือ **"Generate"**
2. รอ Claude สร้างไฟล์ (ประมาณ 2-5 นาที)
3. Claude จะเริ่มสร้างไฟล์ทีละไฟล์

---

## 📝 การทำงานของ Prompt

### Phase 1: Documentation Files
Claude จะสร้างเอกสารก่อน:
- README.md (15KB+)
- QUICKSTART.md
- PROJECT_SUMMARY.md
- CONTRIBUTING.md
- CHANGELOG.md
- LICENSE

**Action**: Copy แต่ละไฟล์และบันทึกในโปรเจค

### Phase 2: Backend Files
Claude จะสร้าง backend:
- backend/src/config/database.js
- backend/src/models/Message.js
- backend/src/controllers/chatController.js
- backend/src/routes/chat.js
- backend/src/server.js
- backend/.env.example
- backend/package.json
- backend/README.md

**Action**: Copy และบันทึกตามโครงสร้างโฟลเดอร์

### Phase 3: Frontend Files
Claude จะสร้าง frontend:
- frontend/src/app/page.js
- frontend/src/app/layout.js
- frontend/src/app/globals.css
- frontend/src/components/ChatInterface.js
- frontend/src/lib/api.js
- frontend/.env.local.example
- frontend/next.config.js
- frontend/tailwind.config.js
- frontend/postcss.config.js
- frontend/package.json
- frontend/README.md

**Action**: Copy และบันทึกตามโครงสร้างโฟลเดอร์

### Phase 4: Config Files
Claude จะสร้างไฟล์เสริม:
- docker-compose.yml
- setup.sh
- .gitignore
- package.json (root)

**Action**: Copy และบันทึก

---

## 💡 Tips สำหรับการใช้งาน

### ถ้า Output ยาวเกินไป
Claude อาจหยุดกลางคัน เพราะ token limit ให้:
1. พิมพ์: **"continue"** หรือ **"please continue"**
2. Claude จะสร้างต่อจากจุดที่หยุด
3. ทำซ้ำจนครบ

### ถ้าต้องการไฟล์เฉพาะ
แทนที่จะรอ Claude สร้างทั้งหมด สามารถขอเฉพาะไฟล์:
```
Create only backend/src/controllers/chatController.js with full content
```

### ถ้าต้องการแก้ไข
```
Fix the error in chatController.js where [describe issue]
```

### ถ้าต้องการเพิ่มฟีเจอร์
```
Add a new feature: [describe feature] to ChatInterface.js
```

---

## 🎯 วิธีบันทึกไฟล์

### Option 1: Copy-Paste ทีละไฟล์ (แนะนำ)
1. Claude สร้างไฟล์มา → Copy content
2. สร้างไฟล์ในเครื่องตามชื่อที่ระบุ
3. Paste content ลงไป
4. Save

### Option 2: ใช้ GitHub Gist
1. Copy ทั้ง output ของ Claude
2. สร้าง [New Gist](https://gist.github.com/)
3. แปลงเป็นไฟล์แยกกันทีหลัง

### Option 3: ใช้ ZIP (ถ้า Claude สร้างให้)
บาง AI studio อาจมีฟีเจอร์ export เป็น ZIP

---

## 🔍 การตรวจสอบความสมบูรณ์

### Checklist ไฟล์ที่ต้องได้
```
✅ README.md (15KB+)
✅ QUICKSTART.md
✅ PROJECT_SUMMARY.md
✅ CONTRIBUTING.md
✅ CHANGELOG.md
✅ LICENSE
✅ backend/ (8 files)
✅ frontend/ (11 files)
✅ docker-compose.yml
✅ setup.sh
✅ .gitignore
✅ package.json (root)
```
**Total: 29+ files**

### Checklist โค้ด
- ✅ ไม่มี `// ... rest of code` หรือ `// TODO`
- ✅ ทุก function สมบูรณ์
- ✅ Error handling ครบ (try-catch)
- ✅ Environment variables ถูกต้อง
- ✅ Dependencies ครบถ้วน

### Checklist เอกสาร
- ✅ README.md มี 20+ sections
- ✅ มีตัวอย่างโค้ด
- ✅ มีขั้นตอนการติดตั้ง
- ✅ มี troubleshooting
- ✅ มี API documentation

---

## ⚠️ ปัญหาที่อาจเจอและวิธีแก้

### ปัญหา 1: Claude หยุดกลางคัน
**อาการ**: Output จบกะทันหัน ยังสร้างไฟล์ไม่ครบ

**วิธีแก้**:
```
continue from where you stopped
```

### ปัญหา 2: โค้ดไม่สมบูรณ์
**อาการ**: มี `...` หรือ `// rest of code`

**วิธีแก้**:
```
Please provide the complete code for [filename] without any truncation or placeholders
```

### ปัญหา 3: ไฟล์ซ้ำกัน
**อาการ**: Claude สร้างไฟล์เดิมซ้ำ

**วิธีแก้**:
```
Skip files already created. Continue with the remaining files starting from [next file name]
```

### ปัญหา 4: Format ไม่ถูกต้อง
**อาการ**: Code block ไม่ถูกต้อง

**วิธีแก้**: Copy เฉพาะ code ข้างใน ```...```

---

## 🎨 Alternative: แบ่งเป็น Parts

ถ้า prompt ใหญ่เกินไป ใช้วิธีแบ่งเป็นส่วน:

### Part 1: Documentation
```
Create these documentation files for Mini Chat Ollama project:
1. README.md (15KB+, 20+ sections)
2. QUICKSTART.md
3. PROJECT_SUMMARY.md
4. CONTRIBUTING.md
5. CHANGELOG.md
6. LICENSE (MIT)

[Include relevant details from main prompt]
```

### Part 2: Backend
```
Create backend files for Mini Chat Ollama:
- Express.js API with 4 AI providers support
- MongoDB integration
- Files: database.js, Message.js, chatController.js, routes/chat.js, server.js
[Include backend specifications from main prompt]
```

### Part 3: Frontend
```
Create frontend files for Mini Chat Ollama:
- Next.js 14 with Tailwind CSS
- Chat interface with provider selection
- Files: ChatInterface.js, api.js, page.js, layout.js, globals.css
[Include frontend specifications from main prompt]
```

### Part 4: Config
```
Create configuration files:
- docker-compose.yml
- setup.sh
- .env.example files
- package.json files
[Include config specifications from main prompt]
```

---

## 📊 Timeline คาดการณ์

| Phase | Time | Description |
|-------|------|-------------|
| Setup | 2 min | เปิด Antigravity, เลือก model |
| Paste Prompt | 1 min | Copy-paste prompt |
| Generation | 5-10 min | Claude สร้างไฟล์ |
| Save Files | 15-20 min | Copy-paste ไฟล์ทั้งหมด |
| Verify | 5 min | ตรวจสอบความสมบูรณ์ |
| **Total** | **30-40 min** | รวมทั้งหมด |

---

## ✅ After Getting All Files

### ขั้นที่ 1: จัดระเบียบโฟลเดอร์
```bash
mkdir mini-chat-ollama
cd mini-chat-ollama

# สร้างโครงสร้าง
mkdir -p backend/src/{config,models,routes,controllers}
mkdir -p frontend/src/{app,components,lib}
```

### ขั้นที่ 2: Paste ไฟล์ทั้งหมด
ใส่ content ที่ Claude สร้างมาลงในไฟล์ตามโครงสร้าง

### ขั้นที่ 3: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### ขั้นที่ 4: Configure Environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env

# Frontend
cd ../frontend
cp .env.local.example .env.local
```

### ขั้นที่ 5: Setup MongoDB
```bash
# ใช้ Docker
docker-compose up -d

# หรือใช้ local MongoDB
mongod
```

### ขั้นที่ 6: Setup Ollama
```bash
# Pull model
ollama pull llama3
```

### ขั้นที่ 7: Run Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### ขั้นที่ 8: Open Browser
```
http://localhost:3000
```

---

## 🎉 Success!

ถ้าทำตามขั้นตอนทั้งหมด คุณจะได้:
- ✅ โปรเจค full-stack สมบูรณ์
- ✅ Support 4 AI providers
- ✅ เอกสารละเอียด 20KB+
- ✅ UI สวยงาม professional
- ✅ พร้อม deploy ได้เลย

---

## 💬 Need Help?

ถ้าติดปัญหา:
1. ตรวจสอบ Checklist ข้างบน
2. อ่าน Troubleshooting section ใน README.md
3. ลองถาม Claude ให้แก้ไข
4. หรือใช้ prompt แบบแยกเป็น parts

---

**Good luck! 🚀**

---

## 📎 Quick Reference

### Prompt ที่มีประโยชน์

**ขอต่อ:**
```
continue
```

**ขอไฟล์เฉพาะ:**
```
Create only [filename] with complete content
```

**ขอแก้ไข:**
```
Fix [issue] in [filename]
```

**ขอเพิ่มฟีเจอร์:**
```
Add [feature] to [component]
```

**ขอ re-generate:**
```
Regenerate [filename] with [specific requirements]
```

---

**สำเร็จด้วยดีนะคะ! 🎊**

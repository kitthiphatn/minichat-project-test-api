# 🌐 การ Deploy บนเซิร์ฟเวอร์และผูกโดเมน

## 📋 สารบัญ

1. [เตรียมเซิร์ฟเวอร์](#1-เตรียมเซิร์ฟเวอร์)
2. [ติดตั้ง Dependencies](#2-ติดตั้ง-dependencies)
3. [Deploy โปรเจค](#3-deploy-โปรเจค)
4. [ตั้งค่า MongoDB](#4-ตั้งค่า-mongodb)
5. [ตั้งค่า Nginx](#5-ตั้งค่า-nginx)
6. [ผูกโดเมน](#6-ผูกโดเมน)
7. [ติดตั้ง SSL (HTTPS)](#7-ติดตั้ง-ssl-https)
8. [ตั้งค่า PM2](#8-ตั้งค่า-pm2)
9. [Monitoring](#9-monitoring)

---

## 1. เตรียมเซิร์ฟเวอร์

### ข้อกำหนดขั้นต่ำ:
- **RAM:** 2GB+
- **CPU:** 2 cores+
- **Storage:** 20GB+
- **OS:** Ubuntu 22.04 LTS (แนะนำ)

### Providers แนะนำ:
- **DigitalOcean** - $6/เดือน
- **Linode** - $5/เดือน
- **Vultr** - $5/เดือน
- **AWS Lightsail** - $5/เดือน

### เชื่อมต่อเซิร์ฟเวอร์:
```bash
ssh root@YOUR_SERVER_IP
```

---

## 2. ติดตั้ง Dependencies

### อัปเดตระบบ:
```bash
apt update && apt upgrade -y
```

### ติดตั้ง Node.js (v18+):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version  # ตรวจสอบ
npm --version
```

### ติดตั้ง MongoDB:
```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
systemctl status mongod
```

### ติดตั้ง Nginx:
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### ติดตั้ง PM2 (Process Manager):
```bash
npm install -g pm2
```

### ติดตั้ง Git:
```bash
apt install -y git
```

---

## 3. Deploy โปรเจค

### Clone โปรเจคจาก GitHub:
```bash
cd /var/www
git clone https://github.com/kitthiphatn/minichat-project-test-api.git
cd minichat-project-test-api
```

### ติดตั้ง Backend:
```bash
cd backend
npm install --production
```

### สร้าง `.env`:
```bash
nano .env
```

**เนื้อหา:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/mini-chat-ollama
OLLAMA_BASE_URL=http://localhost:11434
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
CORS_ORIGIN=https://yourdomain.com
```

### ติดตั้ง Frontend:
```bash
cd ../frontend
npm install
```

### สร้าง `.env.local`:
```bash
nano .env.local
```

**เนื้อหา:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Build Frontend:
```bash
npm run build
```

---

## 4. ตั้งค่า MongoDB

### สร้าง Database และ User:
```bash
mongosh
```

```javascript
use mini-chat-ollama

db.createUser({
  user: "chatuser",
  pwd: "STRONG_PASSWORD_HERE",
  roles: [{ role: "readWrite", db: "mini-chat-ollama" }]
})

exit
```

### อัปเดต Backend `.env`:
```env
MONGODB_URI=mongodb://chatuser:STRONG_PASSWORD_HERE@localhost:27017/mini-chat-ollama
```

---

## 5. ตั้งค่า Nginx

### สร้าง Config สำหรับ Backend:
```bash
nano /etc/nginx/sites-available/api.yourdomain.com
```

**เนื้อหา:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### สร้าง Config สำหรับ Frontend:
```bash
nano /etc/nginx/sites-available/yourdomain.com
```

**เนื้อหา:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Sites:
```bash
ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
```

### ทดสอบและ Reload:
```bash
nginx -t
systemctl reload nginx
```

---

## 6. ผูกโดเมน

### ตั้งค่า DNS Records:

ไปที่ DNS Provider ของคุณ (Cloudflare, Namecheap, etc.) และเพิ่ม:

**A Records:**
```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      Auto
A       www     YOUR_SERVER_IP      Auto
A       api     YOUR_SERVER_IP      Auto
```

**รอ DNS Propagate:** 5-30 นาที

**ตรวจสอบ:**
```bash
ping yourdomain.com
ping api.yourdomain.com
```

---

## 7. ติดตั้ง SSL (HTTPS)

### ติดตั้ง Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

### สร้าง SSL Certificate:
```bash
# Frontend
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Backend
certbot --nginx -d api.yourdomain.com
```

**ตอบคำถาม:**
- Email: your-email@example.com
- Terms: Agree (A)
- Share email: No (N)

### Auto-renewal:
```bash
certbot renew --dry-run
```

Certbot จะ renew อัตโนมัติทุก 90 วัน

---

## 8. ตั้งค่า PM2

### รัน Backend ด้วย PM2:
```bash
cd /var/www/minichat-project-test-api/backend
pm2 start src/server.js --name "chat-backend"
```

### รัน Frontend ด้วย PM2:
```bash
cd /var/www/minichat-project-test-api/frontend
pm2 start npm --name "chat-frontend" -- start
```

### บันทึก PM2 Config:
```bash
pm2 save
pm2 startup
```

### คำสั่ง PM2 ที่ใช้บ่อย:
```bash
pm2 list                 # ดูรายการ apps
pm2 logs                 # ดู logs
pm2 logs chat-backend    # ดู logs ของ backend
pm2 restart all          # restart ทั้งหมด
pm2 stop all             # หยุดทั้งหมด
pm2 delete all           # ลบทั้งหมด
```

---

## 9. Monitoring

### ติดตั้ง PM2 Monitoring:
```bash
pm2 install pm2-logrotate
```

### ดู Resource Usage:
```bash
pm2 monit
```

### ดู Logs:
```bash
# Real-time logs
pm2 logs

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

---

## 🔄 การอัปเดตโปรเจค

### Pull โค้ดใหม่:
```bash
cd /var/www/minichat-project-test-api
git pull origin main
```

### อัปเดต Backend:
```bash
cd backend
npm install --production
pm2 restart chat-backend
```

### อัปเดต Frontend:
```bash
cd ../frontend
npm install
npm run build
pm2 restart chat-frontend
```

---

## 🔒 Security Best Practices

### 1. Firewall (UFW):
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

### 2. Fail2Ban:
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### 3. MongoDB Security:
```bash
# แก้ไข /etc/mongod.conf
nano /etc/mongod.conf
```

**เพิ่ม:**
```yaml
security:
  authorization: enabled
```

**Restart:**
```bash
systemctl restart mongod
```

### 4. Environment Variables:
- ไม่เก็บ API keys ใน Git
- ใช้ `.env` เสมอ
- ตั้งค่า permissions:
```bash
chmod 600 /var/www/minichat-project-test-api/backend/.env
chmod 600 /var/www/minichat-project-test-api/frontend/.env.local
```

---

## 🎯 Checklist สำหรับ Production

- [ ] เซิร์ฟเวอร์มี RAM 2GB+
- [ ] ติดตั้ง Node.js, MongoDB, Nginx
- [ ] Clone โปรเจคจาก GitHub
- [ ] ตั้งค่า `.env` ทั้ง Backend และ Frontend
- [ ] Build Frontend
- [ ] ตั้งค่า Nginx reverse proxy
- [ ] ผูกโดเมนและตั้งค่า DNS
- [ ] ติดตั้ง SSL certificate
- [ ] รัน apps ด้วย PM2
- [ ] ตั้งค่า Firewall
- [ ] ทดสอบทุก features
- [ ] Setup monitoring และ logs

---

## 📞 Support

**ถ้าติดปัญหา:**
1. ตรวจสอบ logs: `pm2 logs`
2. ตรวจสอบ Nginx: `nginx -t`
3. ตรวจสอบ MongoDB: `systemctl status mongod`
4. ตรวจสอบ DNS: `ping yourdomain.com`

---

**สร้างโดย:** Kitthiphat | **วันที่:** 9 ธันวาคม 2024

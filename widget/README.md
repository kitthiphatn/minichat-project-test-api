# 💬 MiniChat Widget - Integration Guide

## ภาพรวม

MiniChat Widget เป็น chatbox ที่สามารถฝังในเว็บไซต์ใดก็ได้ โดยเชื่อมต่อกับ MiniChat API

## ✨ Features

- ✅ UI สวยงาม responsive
- ✅ เชื่อมต่อ MiniChat API
- ✅ รองรับภาษาไทย/อังกฤษ
- ✅ Typing indicator
- ✅ Chat history
- ✅ Minimize/Maximize
- ✅ Mobile responsive

---

## 🚀 วิธีใช้งาน

### วิธีที่ 1: Standalone (ทดสอบ)

เปิดไฟล์ `minichat-widget.html` ในเบราว์เซอร์:

```bash
# เปิดไฟล์โดยตรง
start widget/minichat-widget.html
```

### วิธีที่ 2: Embed ในเว็บไซต์

#### ขั้นตอนที่ 1: Copy Widget Code

Copy โค้ดจาก `minichat-widget.html` ไปวางก่อน `</body>` ในเว็บของคุณ:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to my website</h1>
    
    <!-- MiniChat Widget -->
    <div class="minichat-widget">
        <!-- ... widget code ... -->
    </div>
    
</body>
</html>
```

#### ขั้นตอนที่ 2: ตั้งค่า API URL

แก้ไข `MINICHAT_CONFIG` ในส่วน JavaScript:

```javascript
const MINICHAT_CONFIG = {
    apiUrl: 'https://api.clubfivem.com/api',  // เปลี่ยนเป็น URL จริง
    provider: 'groq',                          // หรือ 'ollama', 'openrouter'
    model: 'llama-3.1-8b-instant',            // model ที่ต้องการ
    sessionId: 'widget-' + Math.random().toString(36).substr(2, 9)
};
```

---

## 🎨 Customization

### เปลี่ยนสี

แก้ไข CSS gradient:

```css
/* ปุ่มและ header */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* เปลี่ยนเป็นสีอื่น เช่น สีเขียว */
background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
```

### เปลี่ยนตำแหน่ง

```css
.minichat-widget {
    bottom: 20px;
    right: 20px;  /* เปลี่ยนเป็น left: 20px; สำหรับซ้าย */
}
```

### เปลี่ยนข้อความต้อนรับ

แก้ไขใน HTML:

```html
<div class="minichat-message ai">
    <div class="minichat-message-content">
        สวัสดีครับ! ผมคือ AI Assistant พร้อมช่วยเหลือคุณแล้ว 😊
    </div>
</div>
```

---

## 📋 ตัวอย่างการใช้งาน

### Example 1: WordPress

วาง widget code ใน footer.php:

```php
<?php wp_footer(); ?>

<!-- MiniChat Widget -->
<div class="minichat-widget">
    <!-- widget code -->
</div>

</body>
</html>
```

### Example 2: React/Next.js

สร้าง component:

```jsx
// components/MiniChatWidget.js
export default function MiniChatWidget() {
  useEffect(() => {
    // Load widget script
  }, []);
  
  return <div id="minichat-widget"></div>;
}
```

### Example 3: Static HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Shop</title>
</head>
<body>
    <h1>Welcome to My Shop</h1>
    
    <!-- Your content -->
    
    <!-- MiniChat Widget -->
    <script src="minichat-widget.js"></script>
</body>
</html>
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | string | `http://localhost:5000/api` | MiniChat API URL |
| `provider` | string | `groq` | AI provider (groq, ollama, openrouter) |
| `model` | string | `llama-3.1-8b-instant` | AI model |
| `sessionId` | string | auto-generated | Session ID สำหรับ chat history |

---

## 🔧 Troubleshooting

### ปัญหา: Widget ไม่แสดง

**แก้ไข:**
1. ตรวจสอบว่า copy code ครบ
2. เช็ค console สำหรับ errors
3. ตรวจสอบ CSS conflicts

### ปัญหา: ไม่สามารถส่งข้อความได้

**แก้ไข:**
1. ตรวจสอบ `apiUrl` ถูกต้อง
2. เช็คว่า Backend รันอยู่
3. ดู Network tab ใน DevTools

### ปัญหา: CORS Error

**แก้ไข:**
Backend ต้องเปิด CORS สำหรับ domain ของคุณ:

```javascript
// backend/src/server.js
app.use(cors({
    origin: ['https://yourdomain.com']
}));
```

---

## 📱 Mobile Support

Widget รองรับ mobile โดยอัตโนมัติ:
- ✅ Responsive design
- ✅ Touch-friendly
- ✅ Full-screen on small devices

---

## 🎯 Best Practices

1. **Performance:**
   - โหลด widget หลังจาก page load เสร็จ
   - ใช้ lazy loading

2. **UX:**
   - ตั้งข้อความต้อนรับที่เหมาะสม
   - ใส่ placeholder ที่ชัดเจน

3. **Security:**
   - ใช้ HTTPS
   - Validate input
   - Rate limiting

---

## 📚 API Reference

### Send Message

```javascript
POST /api/chat/message
Headers: {
    'Content-Type': 'application/json',
    'x-session-id': 'your-session-id'
}
Body: {
    message: 'สวัสดี',
    provider: 'groq',
    model: 'llama-3.1-8b-instant'
}
```

### Get History

```javascript
GET /api/chat/history
Headers: {
    'x-session-id': 'your-session-id'
}
```

---

## 🚀 Next Steps

1. ทดสอบ widget ใน `minichat-widget.html`
2. Customize สี/ตำแหน่งตามต้องการ
3. Embed ในเว็บไซต์ของคุณ
4. Deploy backend ถ้ายังไม่ได้ deploy

---

**Created by:** Kitthiphat | **Date:** 9 มกราคม 2026

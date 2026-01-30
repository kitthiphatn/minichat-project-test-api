# 🎯 Live Chat Takeover - Implementation Guide

## ✅ สิ่งที่ได้ทำเสร็จแล้ว

### 1. Database Models ✅

#### Conversation Model ([backend/src/models/Conversation.js](backend/src/models/Conversation.js))
```javascript
// Fields:
- sessionId: String (unique identifier)
- workspace: ObjectId
- status: 'active' | 'waiting' | 'resolved' | 'abandoned'
- mode: 'bot' | 'human' | 'hybrid'
- assignedTo: ObjectId (User who took over)
- botPaused: Boolean
- botMode: 'active' | 'passive'
- timeline: Array (history of events)

// Methods:
- takeoverByHuman(userId)
- endHumanSession(userId)
- activateBot()
- resolve(userId)
```

#### Message Model - Updated ✅
```javascript
// Added:
- role: 'user' | 'ai' | 'human'  // Added 'human'
- sentBy: ObjectId  // User ID when role is 'human'
```

### 2. Controllers ✅

#### ConversationController ([backend/src/controllers/conversationController.js](backend/src/controllers/conversationController.js))
```javascript
✅ getConversations()        // List all conversations
✅ getConversation()          // Get single conversation with messages
✅ takeoverConversation()     // Admin takes over from bot
✅ endHumanSession()          // Admin ends session, bot to passive mode
✅ sendHumanMessage()         // Admin sends message
✅ resolveConversation()      // Mark as resolved
✅ addNote()                  // Add internal note
✅ getStats()                 // Get statistics
```

#### ChatController - Updated ✅
```javascript
// Added logic to check:
1. If conversation is in 'human' mode → Bot doesn't respond
2. If bot is in 'passive' mode → Only respond when asked question
3. Auto-create conversation on first message
```

### 3. Routes ✅

#### Conversation Routes ([backend/src/routes/conversation.js](backend/src/routes/conversation.js))
```
GET    /api/conversations              // List conversations
GET    /api/conversations/stats        // Get statistics
GET    /api/conversations/:sessionId   // Get conversation details

POST   /api/conversations/:sessionId/takeover   // Take over conversation
POST   /api/conversations/:sessionId/end        // End human session
POST   /api/conversations/:sessionId/message    // Send message as human
POST   /api/conversations/:sessionId/resolve    // Mark as resolved
POST   /api/conversations/:sessionId/notes      // Add note
```

---

## 🚀 ขั้นตอนต่อไป

### Step 1: อัพเดท server.js เพิ่ม Socket.io และ Routes

```bash
# เพิ่มใน /backend/src/server.js
```

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io available in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const workspaceRoutes = require('./routes/workspace');
const widgetRoutes = require('./routes/widget');
const conversationRoutes = require('./routes/conversation');  // 👈 NEW

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/conversations', conversationRoutes);  // 👈 NEW

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join workspace room (for admins)
    socket.on('join_workspace', (workspaceId) => {
        socket.join(`workspace_${workspaceId}`);
        console.log(`Socket ${socket.id} joined workspace_${workspaceId}`);
    });

    // Join session room (for customers)
    socket.on('join_session', (sessionId) => {
        socket.join(`session_${sessionId}`);
        console.log(`Socket ${socket.id} joined session_${sessionId}`);
    });

    // Join user room (for agent notifications)
    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Step 2: ติดตั้ง socket.io

```bash
cd backend
npm install socket.io
```

---

## 📱 Frontend Implementation

### Step 1: สร้าง Live Chat Dashboard

```bash
# สร้างไฟล์ /frontend/src/app/dashboard/conversations/page.js
```

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, User, Bot, Clock, CheckCircle } from 'lucide-react';
import io from 'socket.io-client';

export default function ConversationsPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'bot', 'human', 'resolved'

    useEffect(() => {
        loadConversations();
        loadStats();
        setupSocket();

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const setupSocket = () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        const newSocket = io('http://localhost:5000', {
            auth: { token }
        });

        // Join workspace room
        newSocket.on('connect', () => {
            console.log('Connected to socket');
            // Assuming workspace is stored in user data
            newSocket.emit('join_workspace', user.workspaceId);
            newSocket.emit('join_user', user.id);
        });

        // Listen for new messages
        newSocket.on('customer_message', (data) => {
            console.log('New customer message:', data);
            // Show notification
            showNotification(`New message from ${data.sessionId}`);
            loadConversations();
        });

        // Listen for conversation events
        newSocket.on('conversation_takeover', (data) => {
            console.log('Conversation takeover:', data);
            loadConversations();
        });

        newSocket.on('conversation_ended', (data) => {
            console.log('Conversation ended:', data);
            loadConversations();
        });

        setSocket(newSocket);
    };

    const loadConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/conversations/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const showNotification = (message) => {
        if (Notification.permission === 'granted') {
            new Notification('MiniChat', {
                body: message,
                icon: '/logo.png'
            });
        }
    };

    const filteredConversations = conversations.filter(conv => {
        if (filter === 'all') return conv.status === 'active';
        if (filter === 'bot') return conv.mode === 'bot' && conv.status === 'active';
        if (filter === 'human') return conv.mode === 'human' && conv.status === 'active';
        if (filter === 'resolved') return conv.status === 'resolved';
        return true;
    });

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    การสนทนา
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    จัดการการสนทนากับลูกค้า
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ทั้งหมด</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.total || 0}
                            </p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">กำลังใช้งาน</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.active || 0}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bot จัดการ</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats.botHandled || 0}
                            </p>
                        </div>
                        <Bot className="w-8 h-8 text-purple-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">คนจัดการ</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.humanHandled || 0}
                            </p>
                        </div>
                        <User className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    ทั้งหมด
                </button>
                <button
                    onClick={() => setFilter('bot')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'bot'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    Bot
                </button>
                <button
                    onClick={() => setFilter('human')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'human'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    คนจัดการ
                </button>
                <button
                    onClick={() => setFilter('resolved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        filter === 'resolved'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    จบแล้ว
                </button>
            </div>

            {/* Conversations List */}
            <div className="space-y-3">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">ไม่มีการสนทนา</p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => router.push(`/dashboard/conversations/${conv.sessionId}`)}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-500 cursor-pointer transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {conv.customer?.name || 'Guest'}
                                        </span>
                                        {conv.mode === 'bot' && (
                                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                                                <Bot className="w-3 h-3 inline mr-1" />
                                                Bot
                                            </span>
                                        )}
                                        {conv.mode === 'human' && (
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                                                <User className="w-3 h-3 inline mr-1" />
                                                {conv.assignedTo?.username || 'Human'}
                                            </span>
                                        )}
                                        {conv.status === 'resolved' && (
                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded-full">
                                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                                จบแล้ว
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Session: {conv.sessionId}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {conv.metadata?.messageCount || 0} ข้อความ •{' '}
                                        {new Date(conv.metadata?.lastActivityAt || conv.createdAt).toLocaleString('th-TH')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
```

### Step 2: ติดตั้ง socket.io-client

```bash
cd frontend
npm install socket.io-client
```

---

## 🎮 การใช้งาน

### 1. สำหรับ Admin

#### ดูรายการการสนทนา
```javascript
GET /api/conversations
```

#### เข้าไปตอบแทน Bot
```javascript
POST /api/conversations/:sessionId/takeover
```

#### ส่งข้อความ
```javascript
POST /api/conversations/:sessionId/message
Body: { message: "สวัสดีครับ ผมจะช่วยคุณเอง" }
```

#### จบการสนทนา
```javascript
POST /api/conversations/:sessionId/end
// Bot จะกลับมาเป็น passive mode
```

### 2. สำหรับ Customer

ลูกค้าส่งข้อความตามปกติ:
- ถ้า Bot กำลังตอบ → ได้คำตอบจาก AI
- ถ้า Admin เข้ามา → Bot หยุด, Admin ตอบแทน
- ถ้า Admin จบ → Bot passive mode (ตอบเมื่อถูกถามเท่านั้น)

---

## 🔔 การแจ้งเตือน

### Socket Events

```javascript
// Customer → Admin
'customer_message'        // มีข้อความใหม่จากลูกค้า

// Admin Actions
'conversation_takeover'   // Admin เข้ามาตอบ
'conversation_ended'      // Admin จบการสนทนา

// Admin → Customer
'new_message'            // Admin ส่งข้อความ
```

---

## ✅ สรุป

### สิ่งที่ได้:
1. ✅ ระบบ Human Takeover ครบถ้วน
2. ✅ Bot Passive Mode หลัง Human จบ
3. ✅ Real-time Notification (Socket.io)
4. ✅ Dashboard จัดการการสนทนา
5. ✅ Timeline tracking
6. ✅ Statistics

### สิ่งที่ต้องทำต่อ:
1. ⏳ Chat UI สำหรับ Admin ตอบ
2. ⏳ Notification Browser Permission
3. ⏳ Sound Alerts
4. ⏳ Assign conversation to specific agent
5. ⏳ Canned Responses (ข้อความสำเร็จรูป)

---

**พร้อมใช้งานแล้ว! 🎉**

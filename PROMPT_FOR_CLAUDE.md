# 🤖 Mini Chat App with Ollama - Project Creation Prompt

> **สำหรับ**: Claude Sonnet 4.5 ใน Google AI Studio (Antigravity)  
> **คุณสมบัติพิเศษ**: สร้างไฟล์ผ่าน Artifacts ได้โดยตรง

---

## 📋 คำสั่งสร้างโปรเจค

สร้างโปรเจค **Mini Chat App with Ollama** ที่เป็น full-stack application พร้อม **multi-provider support** ตามรายละเอียดด้านล่าง

---

## 🎯 ข้อกำหนดหลัก

### Tech Stack
- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Frontend**: Next.js 14 (App Router) + React 18 + Tailwind CSS
- **AI Providers**: 
  - Ollama (local) - http://localhost:11434
  - OpenRouter - https://openrouter.ai/api/v1/chat/completions
  - Groq - https://api.groq.com/openai/v1/chat/completions
  - Anthropic - https://api.anthropic.com/v1/messages

### Core Features (Required)
1. ✅ Single-page chat interface
2. ✅ Send/receive messages from AI
3. ✅ Message history stored in MongoDB
4. ✅ User/AI message distinction (different styling)
5. ✅ Loading indicator while AI responds
6. ✅ Error handling and display
7. ✅ Data persistence across page reloads
8. ✅ Max message length: 500 characters

### Bonus Features (Must Implement)
1. ✅ Auto-scroll to newest message
2. ✅ Clear chat button
3. ✅ Schema design for future multi-session support
4. ✅ Character counter (0/500)
5. ✅ Response time display

### Extra Features (Value Add)
1. ✅ **Multi-provider support** - เลือกได้ 4 providers
2. ✅ **Dynamic model selection** - แต่ละ provider มี models หลายตัว
3. ✅ Provider availability detection
4. ✅ Professional UI/UX with gradient background
5. ✅ Comprehensive documentation (15KB+ README)
6. ✅ Setup automation script
7. ✅ Docker Compose for MongoDB

---

## 📁 โครงสร้างโปรเจคที่ต้องสร้าง

```
mini-chat-ollama/
├── 📖 Documentation
│   ├── README.md                    # Main documentation (15KB+, VERY DETAILED)
│   ├── QUICKSTART.md                # 5-minute quick start guide
│   ├── PROJECT_SUMMARY.md           # Project overview and highlights
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── CHANGELOG.md                 # Version history
│   └── LICENSE                      # MIT License
│
├── 🔧 Backend (Express.js API)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # MongoDB connection config
│   │   ├── models/
│   │   │   └── Message.js          # Mongoose schema
│   │   ├── routes/
│   │   │   └── chat.js             # API route definitions
│   │   ├── controllers/
│   │   │   └── chatController.js   # Business logic (4 providers)
│   │   └── server.js               # Express app entry point
│   ├── .env.example                # Environment template
│   ├── package.json                # Backend dependencies
│   └── README.md                   # Backend-specific docs
│
├── 🎨 Frontend (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js            # Main chat page
│   │   │   ├── layout.js          # Root layout
│   │   │   └── globals.css        # Global styles + Tailwind
│   │   ├── components/
│   │   │   └── ChatInterface.js   # Main chat UI component
│   │   └── lib/
│   │       └── api.js             # API client utilities
│   ├── .env.local.example         # Frontend env template
│   ├── next.config.js             # Next.js configuration
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── postcss.config.js          # PostCSS config
│   ├── package.json               # Frontend dependencies
│   └── README.md                  # Frontend-specific docs
│
├── 🐳 DevOps
│   ├── docker-compose.yml         # MongoDB container setup
│   ├── setup.sh                   # Bash installation script
│   └── .gitignore                 # Git ignore rules
│
└── 📦 Root
    └── package.json               # Monorepo scripts
```

**Total: 29+ files ที่ต้องสร้าง**

---

## 🔌 AI Provider Details

### 1. Ollama (Local)
```javascript
Endpoint: http://localhost:11434/api/chat
Method: POST
Body: { model, messages, stream: false }
Models: ['llama3', 'llama3:70b', 'mistral', 'codellama', 'phi3', 'gemma']
Headers: { 'Content-Type': 'application/json' }
Timeout: 60000ms
```

### 2. OpenRouter (Cloud)
```javascript
Endpoint: https://openrouter.ai/api/v1/chat/completions
Method: POST
Body: { model, messages }
Models: [
  'meta-llama/llama-3-8b-instruct',
  'meta-llama/llama-3-70b-instruct',
  'mistralai/mistral-7b-instruct',
  'google/gemini-pro',
  'anthropic/claude-3-haiku'
]
Headers: {
  'Authorization': 'Bearer ${API_KEY}',
  'HTTP-Referer': 'http://localhost:3000',
  'X-Title': 'Mini Chat Ollama'
}
Timeout: 60000ms
```

### 3. Groq (Fast)
```javascript
Endpoint: https://api.groq.com/openai/v1/chat/completions
Method: POST
Body: { model, messages }
Models: [
  'llama3-8b-8192',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
  'gemma-7b-it'
]
Headers: {
  'Authorization': 'Bearer ${API_KEY}',
  'Content-Type': 'application/json'
}
Timeout: 30000ms
```

### 4. Anthropic (Claude)
```javascript
Endpoint: https://api.anthropic.com/v1/messages
Method: POST
Body: { model, max_tokens: 1024, messages }
Models: [
  'claude-3-haiku-20240307',
  'claude-3-sonnet-20240229'
]
Headers: {
  'x-api-key': '${API_KEY}',
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json'
}
Timeout: 60000ms
```

---

## 💾 Database Schema (MongoDB)

### Message Model
```javascript
{
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  provider: {
    type: String,
    enum: ['ollama', 'openrouter', 'groq', 'anthropic'],
    default: 'ollama'
  },
  model: {
    type: String,
    default: 'llama3'
  },
  sessionId: {
    type: String,
    default: 'default'
  },
  metadata: {
    responseTime: Number,
    tokenCount: Number,
    error: String
  },
  timestamps: true // createdAt, updatedAt
}

// Indexes
messageSchema.index({ sessionId: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

// Static Methods
getChatHistory(sessionId, limit)
clearHistory(sessionId)
```

---

## 🎨 UI/UX Specifications

### Design System
```css
/* Colors */
Primary: #4F46E5 (Indigo)
Secondary: #10B981 (Green)
Dark: #1F2937 (Gray)
Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Typography */
Font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

/* Spacing */
Container: max-w-5xl mx-auto p-4
Message bubble: max-w-[70%]
Gap between messages: space-y-4
```

### Message Bubbles
```javascript
User Message:
- Position: Right (justify-end)
- Background: bg-blue-500
- Text: text-white
- Rounded: rounded-lg
- Padding: p-4
- Label: 👤 You

AI Message:
- Position: Left (justify-start)
- Background: bg-gray-100
- Text: text-gray-800
- Border: border border-gray-200
- Rounded: rounded-lg
- Padding: p-4
- Label: 🤖 AI (model_name)
- Extra: Response time in small text
```

### Layout Components
1. **Header Section** (bg-white, rounded-t-xl, shadow-lg, p-6)
   - Title: "🤖 Mini Chat Ollama"
   - Provider dropdown
   - Model dropdown
   - Clear chat button

2. **Messages Area** (flex-1, bg-white, rounded-b-xl, overflow-y-auto, p-6)
   - Empty state message
   - Message list with fade-in animation
   - Loading indicator (3 bouncing dots)
   - Auto-scroll ref

3. **Input Section** (border-t, p-4, bg-gray-50)
   - Error message display (if any)
   - Input field (flex-1)
   - Send button (bg-blue-500, hover:bg-blue-600)
   - Character counter (text-xs, text-gray-500)

### Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce {
  /* For loading dots */
  animation-delay: 0ms, 150ms, 300ms
}
```

---

## 🔧 Backend Implementation Details

### chatController.js Structure

```javascript
// Provider configurations
const PROVIDERS = {
  ollama: { name, endpoint, models },
  openrouter: { name, endpoint, models },
  groq: { name, endpoint, models },
  anthropic: { name, endpoint, models }
};

// Provider-specific functions
async function callOllama(messages, model) {
  // 1. Start timer
  // 2. Make axios POST request
  // 3. Handle response
  // 4. Calculate response time
  // 5. Return { content, responseTime, model }
}

async function callOpenRouter(messages, model) {
  // Similar structure with OpenRouter-specific headers
}

async function callGroq(messages, model) {
  // Similar structure with Groq-specific headers
}

async function callAnthropic(messages, model) {
  // Similar structure with Anthropic-specific headers
}

// Main controller functions
exports.sendMessage = async (req, res) => {
  // 1. Validate input (message length <= 500)
  // 2. Save user message to MongoDB
  // 3. Get conversation history (last 10 messages)
  // 4. Call appropriate AI provider based on req.body.provider
  // 5. Save AI response to MongoDB
  // 6. Return both messages + response time
  // 7. Error handling with try-catch
};

exports.getChatHistory = async (req, res) => {
  // 1. Get sessionId from query
  // 2. Call Message.getChatHistory()
  // 3. Return messages
};

exports.clearChat = async (req, res) => {
  // 1. Get sessionId from body
  // 2. Call Message.clearHistory()
  // 3. Return success
};

exports.getProviders = async (req, res) => {
  // 1. Check which API keys are configured
  // 2. Return providers with availability flags
};
```

### API Routes (chat.js)
```javascript
router.get('/providers', chatController.getProviders);
router.get('/history', chatController.getChatHistory);
router.post('/message', chatController.sendMessage);
router.post('/clear', chatController.clearChat);
```

### Server Setup (server.js)
```javascript
// 1. Load environment variables
// 2. Connect to MongoDB
// 3. Setup middleware (cors, express.json, morgan)
// 4. Health check endpoint
// 5. Mount chat routes
// 6. Error handling middleware
// 7. 404 handler
// 8. Start server with console art
```

---

## 🎨 Frontend Implementation Details

### ChatInterface.js Structure

```javascript
// State Management
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [providers, setProviders] = useState({});
const [selectedProvider, setSelectedProvider] = useState('ollama');
const [selectedModel, setSelectedModel] = useState('llama3');
const messagesEndRef = useRef(null);

// Effects
useEffect(() => {
  loadProviders();
  loadHistory();
}, []);

useEffect(() => {
  scrollToBottom();
}, [messages]);

// Functions
const loadProviders = async () => {
  // Fetch from /api/chat/providers
};

const loadHistory = async () => {
  // Fetch from /api/chat/history
};

const handleSubmit = async (e) => {
  // 1. Prevent default
  // 2. Validate input
  // 3. Show user message immediately
  // 4. Call API
  // 5. Update with real messages
  // 6. Handle errors
};

const handleClearChat = async () => {
  // 1. Confirm
  // 2. Call API
  // 3. Clear state
};

const handleProviderChange = (e) => {
  // 1. Update provider
  // 2. Update model to first available
};

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

// JSX Structure
return (
  <div className="flex flex-col h-screen">
    {/* Header with selectors */}
    {/* Messages area */}
    {/* Input area */}
    {/* Footer */}
  </div>
);
```

### API Client (api.js)
```javascript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const getProviders = async () => { /* ... */ };
export const getChatHistory = async (sessionId) => { /* ... */ };
export const sendMessage = async (message, provider, model, sessionId) => { /* ... */ };
export const clearChat = async (sessionId) => { /* ... */ };
```

---

## 📦 Dependencies

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🌍 Environment Variables

### Backend (.env.example)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mini-chat-ollama

# Ollama Configuration (Required)
OLLAMA_BASE_URL=http://localhost:11434

# OpenRouter API (Optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Groq API (Optional)
GROQ_API_KEY=your_groq_api_key_here

# Anthropic API (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local.example)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📚 Documentation Requirements

### Main README.md (Must be 15KB+)

**Required Sections:**
1. **Title & Badges** - Project name, version, license badges
2. **Table of Contents** - Links to all sections
3. **Overview** - What this project is, why it exists
4. **Features** - List all Required, Bonus, and Extra features
5. **Tech Stack** - Detailed breakdown with versions
6. **Architecture** - ASCII diagram showing data flow
7. **Prerequisites** - Node.js, MongoDB, Ollama installation commands
8. **Installation** - Step-by-step with both Docker and local options
9. **Configuration** - Environment variable explanations
10. **Running the Application** - Dev and production modes
11. **API Documentation** - All endpoints with request/response examples
12. **Project Structure** - Complete file tree with descriptions
13. **Usage Guide** - How to use each feature
14. **Troubleshooting** - At least 6 common issues with solutions
15. **Testing** - Manual testing instructions
16. **Screenshots** - ASCII art mockups
17. **Future Enhancements** - Roadmap items
18. **Development Notes** - Design decisions
19. **Contributing** - Link to CONTRIBUTING.md
20. **License** - MIT License mention
21. **Author & Acknowledgments**
22. **Time Spent** - Mention 2-3 hours recommended, 4-5 actual

### QUICKSTART.md
- Prerequisites checklist
- 5-minute installation guide
- Quick troubleshooting
- Next steps section

### PROJECT_SUMMARY.md
- What's included overview
- Complete file structure
- Tech stack summary
- Quick start commands
- Feature highlights
- Statistics (files, lines, providers)

### CONTRIBUTING.md
- How to report issues
- How to submit PRs
- Code style guide
- Testing requirements
- Areas for contribution

### CHANGELOG.md
- Version 1.0.0 with all features
- Future version plans
- Legend of change types

### Backend README.md
- Quick start for backend
- Environment variables
- API endpoints
- Dependencies
- Testing
- Troubleshooting

### Frontend README.md
- Quick start for frontend
- Environment variables
- Component structure
- Styling approach
- Testing
- Deployment options

---

## 🐳 Docker & DevOps

### docker-compose.yml
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: mini-chat-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: mini-chat-ollama
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### setup.sh (Bash Script)
```bash
#!/bin/bash
# 1. Check Node.js, npm, MongoDB/Docker, Ollama
# 2. Install backend dependencies
# 3. Install frontend dependencies
# 4. Create .env files from examples
# 5. Start MongoDB with docker-compose
# 6. Print next steps (start Ollama, pull model, run servers)
# Make it executable: chmod +x setup.sh
```

### .gitignore
```
node_modules/
.env
.env.local
.next/
dist/
build/
logs/
*.log
.DS_Store
```

---

## ✅ Quality Checklist

### Functionality
- [ ] User can send messages
- [ ] AI responds correctly
- [ ] Messages persist in MongoDB
- [ ] Provider switching works
- [ ] Model selection updates
- [ ] Clear chat works
- [ ] Auto-scroll works
- [ ] Loading indicator shows
- [ ] Error messages display
- [ ] Character counter works
- [ ] Response time displays

### Code Quality
- [ ] Clean, readable code
- [ ] Proper error handling (try-catch everywhere)
- [ ] Input validation (message length, required fields)
- [ ] Comments on complex logic
- [ ] Consistent naming conventions
- [ ] Separated concerns (MVC pattern)
- [ ] Environment variables for config
- [ ] No hardcoded values

### UI/UX
- [ ] Responsive design (mobile-friendly)
- [ ] Professional appearance
- [ ] Smooth animations
- [ ] Clear visual feedback
- [ ] Proper loading states
- [ ] Error messages user-friendly
- [ ] Intuitive navigation

### Documentation
- [ ] Main README is 15KB+ and comprehensive
- [ ] All sections included
- [ ] Code examples provided
- [ ] Installation steps clear
- [ ] Troubleshooting covers common issues
- [ ] API documented with examples
- [ ] Screenshots/diagrams included

### DevOps
- [ ] Docker Compose works
- [ ] Setup script runs without errors
- [ ] .env.example files present
- [ ] .gitignore configured
- [ ] Package.json scripts work

---

## 🎯 Success Criteria

โปรเจคที่สมบูรณ์ต้อง:

1. ✅ **ครบทุกข้อกำหนดตามโจทย์** (Required features)
2. ✅ **มี Bonus features ทั้งหมด** (Auto-scroll, Clear chat, Multi-session schema)
3. ✅ **Support 4 AI providers** (Ollama, OpenRouter, Groq, Anthropic)
4. ✅ **Dynamic model selection** (แต่ละ provider มี models หลายตัว)
5. ✅ **README 15KB+** ที่ละเอียดครบถ้วน
6. ✅ **Production-ready code** (error handling, validation, logging)
7. ✅ **Professional UI/UX** (สวยงาม responsive)
8. ✅ **Easy setup** (มี setup script)
9. ✅ **Complete documentation** (8+ files)
10. ✅ **29+ files พร้อม content เต็ม**

---

## 📝 Instructions for Claude

**กรุณาสร้างไฟล์ทั้งหมดตามลำดับ:**

1. **เริ่มจาก Documentation files** (README.md, QUICKSTART.md, etc.)
2. **Backend files** (database.js, Message.js, chatController.js, etc.)
3. **Frontend files** (ChatInterface.js, api.js, page.js, etc.)
4. **Config files** (.env.example, docker-compose.yml, etc.)
5. **DevOps files** (setup.sh, .gitignore, LICENSE)

**สำคัญ:**
- ✅ สร้างไฟล์ทีละไฟล์ โดยใส่ **content เต็ม** ไม่ต้อง truncate
- ✅ README.md ต้องยาว **15KB+** มี 20+ sections
- ✅ Code ต้องสมบูรณ์ ไม่มี `// ... rest of code`
- ✅ แต่ละ provider ต้องมี function แยกกัน
- ✅ UI ต้องสวย มี gradient background
- ✅ เอกสารต้องละเอียด มีตัวอย่างโค้ด

**ถ้า output ยาวเกินไป:**
- แยกสร้างทีละส่วน (Documentation → Backend → Frontend → Config)
- ฉันจะพิมพ์ "continue" เมื่อต้องการส่วนต่อไป

---

## 🚀 Expected Result

สร้างโปรเจค full-stack ที่:
- มี 29+ ไฟล์ครบถ้วน
- Support 4 AI providers
- เอกสารละเอียด 20KB+ total
- UI สวยงาม professional
- โค้ดสะอาด production-ready
- ติดตั้งง่าย มี automation
- พร้อมใช้งานจริง

---

**เริ่มสร้างได้เลย! 🎉**

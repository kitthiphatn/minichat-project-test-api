# 🤖 Quick Start Prompts - Copy & Paste ได้เลย

> Prompts สำเร็จรูปที่คุณสามารถส่งให้ AI หรือ developer ทำงานต่อได้ทันที

---

## 📚 วิธีใช้งาน

1. **เลือก Phase/Task** ที่ต้องการทำ
2. **Copy prompt** ทั้งหมด
3. **Paste** ส่งให้ Claude, ChatGPT หรือ developer
4. **รับ code** และ implementation กลับมา

---

## 🔒 PHASE 1: SECURITY FOUNDATION

### Prompt 1.1: CORS Security Setup
```
ช่วยแก้ไข CORS configuration ในโปรเจค MiniChat SaaS ให้ปลอดภัย

Current Code (backend/src/server.js):
```javascript
app.use(cors({
    origin: true,
    credentials: true,
}));
```

Requirements:
1. จำกัด origins เฉพาะที่อนุญาต
2. อ่าน origins จาก environment variable ALLOWED_ORIGINS
3. รองรับหลาย domains (comma-separated)
4. อนุญาต requests ที่ไม่มี origin (mobile apps, Postman)
5. แสดง error ชัดเจนเมื่อ CORS fail

Expected .env:
```
ALLOWED_ORIGINS=https://chat.clubfivem.com,http://localhost:3000
```

Please provide:
- ✅ Complete updated code
- ✅ Testing commands
- ✅ Error handling
```

---

### Prompt 1.2: Rate Limiting Implementation
```
ช่วยเพิ่ม rate limiting ให้โปรเจค MiniChat SaaS เพื่อป้องกัน brute force และ DDoS

Project Structure:
- Backend: Express.js
- Routes: /api/auth/login, /api/auth/register, /api/chat/*

Requirements:
1. General API rate limit: 100 requests/15 minutes
2. Auth endpoints (login, register): 5 requests/15 minutes
3. Registration: 3 requests/hour per IP
4. Return clear error message with retry time
5. Don't count successful login attempts

Installation needed:
```bash
npm install express-rate-limit
```

Please provide:
- ✅ middleware/rateLimiter.js (complete code)
- ✅ How to apply to server.js
- ✅ How to apply to auth routes
- ✅ Testing instructions
```

---

### Prompt 1.3: Helmet.js Security Headers
```
ช่วยติดตั้งและตั้งค่า Helmet.js สำหรับโปรเจค MiniChat SaaS

Framework: Express.js
File: backend/src/server.js

Requirements:
1. Install helmet
2. Enable security headers:
   - Content Security Policy (allow API calls to Groq, Anthropic, OpenRouter)
   - HSTS (Strict Transport Security)
   - X-Frame-Options (prevent clickjacking)
   - X-Content-Type-Options (prevent MIME sniffing)
   - XSS Filter
3. Compatible with CORS settings
4. Don't break existing functionality

Please provide:
- ✅ Installation command
- ✅ Complete configuration code
- ✅ Where to add in server.js
- ✅ How to test it works
```

---

### Prompt 1.4: Environment Variables Validation
```
ช่วยสร้างระบบ validate environment variables ตอน startup

Project: MiniChat SaaS (Express.js + MongoDB)

Required Variables:
- MONGODB_URI (required, must be valid URI)
- JWT_SECRET (required, min 32 characters)
- PORT (optional, default 5001)
- NODE_ENV (development/production/test)
- ALLOWED_ORIGINS (required)
- AI Provider Keys (at least one required):
  - GROQ_API_KEY
  - OPENROUTER_API_KEY
  - ANTHROPIC_API_KEY
- OAuth (optional):
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- Email (optional):
  - SENDGRID_API_KEY, SENDGRID_FROM_EMAIL

Installation:
```bash
npm install joi
```

Requirements:
1. Validate on server startup
2. Exit with error if validation fails
3. Show clear error messages
4. Warn if no AI provider configured
5. Log successful validation

Please provide:
- ✅ config/validateEnv.js (complete code)
- ✅ How to use in server.js
- ✅ Example .env file
```

---

### Prompt 1.5: Input Validation & Sanitization
```
ช่วยเพิ่ม input validation และ sanitization เพื่อป้องกัน XSS, Injection

Project: MiniChat SaaS
Routes: /api/auth/register, /api/chat/message

Installation:
```bash
npm install express-validator xss
```

Requirements:
1. Registration validation:
   - Email: valid format, normalized
   - Username: 3-30 chars, alphanumeric + underscore/dash
   - Password: min 8 chars, must have uppercase, lowercase, number, special char

2. Message validation:
   - Not empty
   - Max 500 characters
   - Sanitize HTML/scripts
   - Strip all tags

3. Return clear validation errors
4. Sanitize ALL user input (XSS protection)

Please provide:
- ✅ middleware/validators.js (complete code)
- ✅ How to apply to routes
- ✅ Example validation errors
- ✅ Testing with malicious input
```

---

### Prompt 1.6: Database Indexes Setup
```
ช่วยเพิ่ม database indexes เพื่อเพิ่มประสิทธิภาพ query

Project: MiniChat SaaS (MongoDB + Mongoose)

Models:
1. User (backend/src/models/User.js):
   - Fields: email, username, role, createdAt, resetPasswordExpire

2. Workspace (backend/src/models/Workspace.js):
   - Fields: owner, apiKey, plan, createdAt, usage.resetDate

3. Message (backend/src/models/Message.js):
   - Fields: sessionId, createdAt, provider

Requirements:
1. Add indexes สำหรับ frequent queries:
   - User: email, username, role, createdAt
   - Workspace: owner, plan, apiKey, createdAt
   - Message: sessionId+createdAt (compound), provider+createdAt

2. TTL index สำหรับ Message (optional, 90 days auto-delete)
3. Sparse index สำหรับ resetPasswordExpire

Please provide:
- ✅ Updated model files with indexes
- ✅ Script to verify indexes
- ✅ MongoDB commands to check indexes
```

---

### Prompt 1.7: Structured Logging with Winston
```
ช่วยเปลี่ยนจาก console.log เป็น Winston structured logging

Project: MiniChat SaaS (Express.js)

Installation:
```bash
npm install winston winston-daily-rotate-file
```

Requirements:
1. Log levels: error, warn, info, debug
2. Log format: JSON with timestamp
3. File rotation:
   - Error logs: logs/error-YYYY-MM-DD.log (keep 30 days)
   - Combined logs: logs/combined-YYYY-MM-DD.log (keep 14 days)
4. Console logging in development only
5. Colorized console output
6. Include metadata: service name, timestamp

Usage examples needed:
- Replace console.log('[INFO] User registered')
- Replace console.error('[ERROR] DB connection failed')
- Log with metadata (userId, ip, etc.)

Please provide:
- ✅ config/logger.js (complete code)
- ✅ How to replace console.log across project
- ✅ Example usage in controllers
- ✅ Log file structure
```

---

## 💰 PHASE 2: PAYMENT INTEGRATION

### Prompt 2.1: Stripe Payment Integration
```
ช่วยเพิ่ม Stripe payment integration แบบสมบูรณ์

Project: MiniChat SaaS
Backend: Express.js + MongoDB

Plans:
- Free: 250 messages/month ($0)
- Starter: 2,000 messages/month ($9/month or $90/year)
- Pro: 10,000 messages/month ($29/month or $290/year)
- Business: 50,000 messages/month ($99/month or $990/year)

Installation:
```bash
npm install stripe
```

Requirements:
1. Checkout session creation
2. Webhook handler for events:
   - checkout.session.completed
   - invoice.payment_succeeded
   - invoice.payment_failed
   - customer.subscription.deleted
3. Update Workspace model:
   - Add stripeCustomerId, stripeSubscriptionId fields
   - Update plan and messagesLimit on payment
4. Create PaymentTransaction record
5. Handle subscription cancellation (downgrade to free)

Environment variables:
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FRONTEND_URL=http://localhost:3000
```

Please provide:
- ✅ services/stripeService.js (complete implementation)
- ✅ Updated routes/payment.js
- ✅ Updated models/Workspace.js
- ✅ Webhook testing instructions
- ✅ Stripe Dashboard setup guide
```

---

### Prompt 2.2: Complete Email Service
```
ช่วยสร้างระบบ email แบบสมบูรณ์สำหรับ transactional emails

Project: MiniChat SaaS
Email Provider: SendGrid (with Nodemailer fallback)

Installation:
```bash
npm install @sendgrid/mail nodemailer
```

Email Templates Needed:
1. Welcome Email (after registration)
   - Username, Workspace name, API key
   - Link to dashboard

2. Payment Confirmation (after successful payment)
   - Plan name, Amount, Invoice link

3. Quota Alert (90% usage)
   - Current usage, Limit, Upgrade link

4. Team Invitation (for future feature)
   - Inviter name, Workspace name, Accept link

5. Password Reset (already exists, but improve)

Requirements:
- Use SendGrid when SENDGRID_API_KEY exists
- Fallback to SMTP/Nodemailer
- HTML email templates
- Error handling (log but don't break app)
- Test mode (console log only in development)

Environment:
```
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com (fallback)
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx
```

Please provide:
- ✅ services/emailService.js (complete code)
- ✅ How to use in controllers (registration, payment)
- ✅ Email templates (HTML)
- ✅ Testing instructions
```

---

## 🔴 PHASE 2: REAL-TIME FEATURES

### Prompt 2.3: Socket.IO Implementation
```
ช่วยเพิ่ม real-time features ด้วย Socket.IO

Project: MiniChat SaaS
Stack: Express.js (Backend) + Next.js (Frontend)

Installation:
```bash
# Backend
npm install socket.io

# Frontend
npm install socket.io-client
```

Features Needed:
1. Real-time new messages in chat
2. Typing indicators
3. Quota alerts (when reaching 90%)
4. Notifications for workspace owner
5. Online/offline status

Requirements:
1. JWT authentication for socket connections
2. Room-based (workspace rooms, session rooms)
3. Error handling
4. Reconnection logic
5. CORS compatible with existing setup

Files to create/modify:
- Backend: socket.js, server.js
- Frontend: lib/socket.js

Please provide:
- ✅ backend/src/socket.js (complete service)
- ✅ Updated server.js (http.createServer setup)
- ✅ frontend/src/lib/socket.js (client)
- ✅ How to emit events from controllers
- ✅ Testing with multiple clients
```

---

## 📊 PHASE 3: PRODUCTION READY

### Prompt 3.1: Error Handling Standardization
```
ช่วยสร้างระบบ error handling แบบมาตรฐาน

Project: MiniChat SaaS (Express.js)

Requirements:
1. Custom Error Classes:
   - AppError (base)
   - ValidationError (400)
   - AuthenticationError (401)
   - AuthorizationError (403)
   - NotFoundError (404)
   - RateLimitError (429)

2. Global Error Handler Middleware:
   - Handle Mongoose errors (CastError, ValidationError, duplicate key)
   - Handle JWT errors
   - Log errors
   - Standardized response format
   - Stack trace in development only

3. Async Handler Wrapper:
   - Catch async errors automatically

4. Response Format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": []
  },
  "metadata": {
    "timestamp": "...",
    "requestId": "..."
  }
}
```

Please provide:
- ✅ utils/errors.js (custom error classes)
- ✅ middleware/errorHandler.js (global handler)
- ✅ utils/asyncHandler.js (wrapper)
- ✅ How to use in controllers
- ✅ Example error responses
```

---

### Prompt 3.2: API Documentation with Swagger
```
ช่วยสร้าง API documentation ด้วย Swagger/OpenAPI

Project: MiniChat SaaS
Routes: auth, chat, workspaces, widget, upload, payment, admin

Installation:
```bash
npm install swagger-jsdoc swagger-ui-express
```

Requirements:
1. OpenAPI 3.0 spec
2. Document all endpoints:
   - Auth: register, login, OAuth
   - Chat: providers, history, message
   - Workspaces: CRUD, settings
   - Payment: checkout, webhook
3. Authentication schemes:
   - Bearer JWT
   - API Key (x-api-key header)
4. Request/response examples
5. Error responses
6. Serve docs at /api-docs

Servers:
- Development: http://localhost:5001
- Production: https://api.clubfivem.com

Please provide:
- ✅ config/swagger.js
- ✅ JSDoc comments for routes
- ✅ How to add to server.js
- ✅ Example documentation
```

---

### Prompt 3.3: Docker Setup
```
ช่วยสร้าง Docker configuration สำหรับ deployment

Project: MiniChat SaaS
Stack: Node.js (Backend + Frontend), MongoDB, Redis

Requirements:
1. Dockerfile for backend (Node 18+)
2. Dockerfile for frontend (Next.js)
3. docker-compose.yml:
   - backend service
   - frontend service
   - mongodb service
   - redis service
4. Multi-stage builds (optimize size)
5. Health checks
6. Volume mounts for development
7. Environment variables
8. Production-ready configurations

Files to create:
- backend/Dockerfile
- frontend/Dockerfile
- docker-compose.yml
- docker-compose.prod.yml
- .dockerignore

Please provide:
- ✅ All Dockerfiles
- ✅ docker-compose files
- ✅ Build commands
- ✅ Run commands
- ✅ Environment setup
```

---

## 🎨 ADDITIONAL FEATURES

### Prompt: Lead Capture System
```
ช่วยสร้างระบบจัดการ leads สำหรับ contact form

Project: MiniChat SaaS

Requirements:
1. Lead Model:
   - name, email, phone, company, message
   - sessionId (link to chat)
   - status: new, contacted, qualified, converted, lost
   - assignedTo (team member)
   - notes (array of comments)
   - metadata: ip, userAgent, referrer, country

2. API Endpoints:
   - POST /api/leads/capture (public, with API key)
   - GET /api/leads (protected, with filters)
   - PUT /api/leads/:id/status (update status)
   - POST /api/leads/:id/notes (add note)

3. Features:
   - Email notification to workspace owner on new lead
   - Real-time notification via Socket.IO
   - Export leads to CSV

Please provide:
- ✅ models/Lead.js
- ✅ routes/leads.js
- ✅ Email notification integration
- ✅ Frontend component example (optional)
```

---

### Prompt: Analytics & Reporting
```
ช่วยสร้างระบบ analytics แบบละเอียด

Project: MiniChat SaaS

Requirements:
1. Analytics Model:
   - Daily aggregation per workspace
   - Metrics:
     - totalMessages, totalSessions, uniqueUsers
     - averageSessionDuration, averageMessagesPerSession
     - averageResponseTime
     - byProvider (messages + response time per provider)
     - conversions (leads, forms, goals)
     - satisfaction (reactions, ratings)

2. Service:
   - aggregateDailyMetrics() - run daily via cron
   - getReport(workspaceId, startDate, endDate)
   - calculateTrends()
   - compareWithPrevious()

3. API Endpoints:
   - GET /api/analytics/dashboard
   - GET /api/analytics/report?from=&to=
   - GET /api/analytics/providers (compare providers)

4. Cron Job:
   - Run at 2 AM daily
   - Aggregate previous day's data

Installation:
```bash
npm install node-cron
```

Please provide:
- ✅ models/Analytics.js
- ✅ services/analyticsService.js
- ✅ routes/analytics.js
- ✅ jobs/analytics.js (cron)
- ✅ Dashboard metrics calculation
```

---

### Prompt: Redis Caching Layer
```
ช่วยเพิ่ม Redis caching เพื่อเพิ่มประสิทธิภาพ

Project: MiniChat SaaS

Installation:
```bash
npm install redis
```

Caching Strategy:
1. AI Provider availability (5 minutes TTL)
2. Workspace settings (10 minutes TTL)
3. Chat history (1 minute TTL)
4. User sessions (30 minutes TTL)

Requirements:
1. Redis client configuration with reconnection
2. Cache middleware:
   - Check cache before executing
   - Store response in cache
   - Set TTL
3. Cache invalidation:
   - When workspace updated
   - When new message sent
4. Error handling (fail gracefully if Redis down)

Environment:
```
REDIS_URL=redis://localhost:6379
```

Please provide:
- ✅ config/redis.js (client setup)
- ✅ middleware/cache.js (cache middleware)
- ✅ How to apply to routes
- ✅ Cache invalidation examples
- ✅ docker-compose Redis service
```

---

## 📝 GENERAL PURPOSE PROMPTS

### Prompt: Code Review & Optimization
```
ช่วย review และ optimize code ในไฟล์ต่อไปนี้:

File: [paste file path]

```javascript
[paste code here]
```

Please review for:
1. Security vulnerabilities
2. Performance issues
3. Best practices
4. Error handling
5. Code organization

Provide:
- ✅ Issues found with severity
- ✅ Optimized code
- ✅ Explanation of changes
- ✅ Testing recommendations
```

---

### Prompt: Bug Fix
```
ช่วยแก้ bug ในโปรเจค MiniChat SaaS

Bug Description:
[describe the bug]

Expected Behavior:
[what should happen]

Actual Behavior:
[what actually happens]

Code:
```javascript
[paste relevant code]
```

Error Message (if any):
```
[paste error]
```

Please provide:
- ✅ Root cause analysis
- ✅ Fixed code
- ✅ Explanation
- ✅ How to prevent similar bugs
```

---

### Prompt: Feature Implementation
```
ช่วยเพิ่มฟีเจอร์ใหม่ให้โปรเจค MiniChat SaaS

Feature: [feature name]

Requirements:
[list requirements]

Existing Code Structure:
- Models: [list relevant models]
- Routes: [list relevant routes]
- Controllers: [list relevant controllers]

Please provide:
- ✅ Model changes (if needed)
- ✅ New/updated routes
- ✅ Controller implementation
- ✅ Testing instructions
- ✅ Frontend integration (if needed)
```

---

## 🎯 HOW TO USE THESE PROMPTS

### Option 1: Send to AI (Claude, ChatGPT)
1. Copy prompt ทั้งหมด
2. Paste ส่งให้ AI
3. รับ code กลับมา
4. Test และ implement

### Option 2: Send to Developer
1. Copy prompt
2. แปลเป็นภาษาไทย (ถ้าต้องการ)
3. ส่งให้ developer
4. Review code ที่ได้

### Option 3: Use as Documentation
1. เก็บเป็น requirements
2. ใช้เป็น checklist
3. Track progress

---

## ✅ PROMPT TEMPLATE (สร้าง prompt ใหม่)

```
ช่วย[ทำอะไร]สำหรับโปรเจค MiniChat SaaS

Project Context:
- Stack: [Express.js, Next.js, MongoDB, etc.]
- Current Status: [MVP, Production, etc.]

Requirements:
1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

Installation (if needed):
```bash
npm install [packages]
```

Current Code:
```javascript
[paste current code if modifying existing]
```

Please provide:
- ✅ [File 1] (complete code)
- ✅ [File 2] (complete code)
- ✅ How to integrate
- ✅ Testing instructions
- ✅ Environment variables (if needed)
```

---

## 📊 PROMPT USAGE GUIDE

### เมื่อไหร่ใช้ prompt ไหน:

| Phase | Prompts | ใช้เวลา | Priority |
|-------|---------|--------|----------|
| **Week 1** | 1.1-1.7 (Security) | 7 days | ⭐⭐⭐⭐⭐ |
| **Week 2** | 2.1-2.2 (Payment+Email) | 5 days | ⭐⭐⭐⭐⭐ |
| **Week 3** | 2.3 (Real-time) | 3 days | ⭐⭐⭐⭐ |
| **Week 4** | 3.1-3.3 (Production) | 6 days | ⭐⭐⭐⭐ |
| **Future** | Additional Features | varies | ⭐⭐⭐ |

---

## 🚀 QUICK START

**วันนี้เลย - ส่ง Prompt 1.1:**
```
Copy prompt "CORS Security Setup" ด้านบน
→ Send to Claude/ChatGPT
→ Get code
→ Implement
→ Test
→ Next prompt!
```

**เป้าหมายสัปดาห์นี้:**
- ✅ ทำ Prompt 1.1 - 1.7 ให้ครบ
- ✅ Security foundation complete!

---

## 💡 TIPS

1. **ทำทีละ prompt** - อย่ารีบ
2. **Test ทุกครั้ง** - ก่อนไป prompt ถัดไป
3. **Commit บ่อยๆ** - แต่ละ prompt ที่สำเร็จ
4. **อ่าน code ที่ได้** - เพื่อเข้าใจ
5. **Customize** - ปรับแต่งตามต้องการ

---

**Total Prompts:** 20+
**Copy-Paste Ready:** ✅
**Production Ready:** ✅
**Let's build! 🚀**

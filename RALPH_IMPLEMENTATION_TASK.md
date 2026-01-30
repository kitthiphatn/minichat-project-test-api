# 🤖 Ralph-loop Implementation Task: Live Chat Takeover System

## 📋 Overview
Implement a complete Live Chat Takeover system that allows human agents to take over conversations from the AI bot, send messages as humans, and return control to the bot in passive mode.

---

## 🎯 Implementation Checklist

### Phase 1: Database Models ✅ (Partially Done)

#### 1.1 Message Model (ALREADY UPDATED - SKIP)
- ✅ Already has `role: 'human'` added
- ✅ Already has `sentBy: ObjectId` added
- **Action: SKIP - Already completed**

#### 1.2 Conversation Model (NEW - IMPLEMENT)
**File:** `/home/minipc/Desktop/minichat/backend/src/models/Conversation.js`
**Status:** ✅ File created, needs testing

**Validation:**
- [ ] Model exports correctly: `require('./models/Conversation')` works
- [ ] Can create conversation: `Conversation.create({ sessionId: 'test', workspace: workspaceId })`
- [ ] Methods work: `takeoverByHuman()`, `endHumanSession()`, `activateBot()`
- [ ] Static method works: `Conversation.findOrCreate(sessionId, workspaceId)`

---

### Phase 2: Controllers

#### 2.1 Conversation Controller (NEW - IMPLEMENT)
**File:** `/home/minipc/Desktop/minichat/backend/src/controllers/conversationController.js`
**Status:** ✅ File created, needs integration

**Required Functions:**
1. `getConversations(req, res)` - List all conversations
2. `getConversation(req, res)` - Get single conversation with messages
3. `takeoverConversation(req, res)` - Human takeover
4. `endHumanSession(req, res)` - End human session
5. `sendHumanMessage(req, res)` - Send message as human
6. `resolveConversation(req, res)` - Mark resolved
7. `addNote(req, res)` - Add note
8. `getStats(req, res)` - Get statistics

**Validation:**
- [ ] All functions exported correctly
- [ ] Error handling in place
- [ ] Workspace verification working
- [ ] Returns correct status codes (200, 400, 403, 404, 500)

#### 2.2 Chat Controller (UPDATE - IMPLEMENT)
**File:** `/home/minipc/Desktop/minichat/backend/src/controllers/chatController.js`
**Status:** ⏳ Partially updated, needs completion

**Required Changes:**
1. Add `const Conversation = require('../models/Conversation');` at top
2. In `sendMessage()` function, add conversation checking logic:
   - Check if conversation is in 'human' mode → Bot doesn't respond
   - Check if bot is in 'passive' mode → Only respond to questions
   - Create/update conversation on every message

**Validation:**
- [ ] Bot stops responding when conversation.mode === 'human'
- [ ] Bot passive mode works (only responds to questions with ?)
- [ ] Conversation activity updates on every message
- [ ] No breaking changes to existing chat functionality

---

### Phase 3: Routes

#### 3.1 Conversation Routes (NEW - IMPLEMENT)
**File:** `/home/minipc/Desktop/minichat/backend/src/routes/conversation.js`
**Status:** ✅ File created, needs server integration

**Routes:**
```
GET    /api/conversations
GET    /api/conversations/stats
GET    /api/conversations/:sessionId
POST   /api/conversations/:sessionId/takeover
POST   /api/conversations/:sessionId/end
POST   /api/conversations/:sessionId/message
POST   /api/conversations/:sessionId/resolve
POST   /api/conversations/:sessionId/notes
```

**Validation:**
- [ ] All routes use `protect` middleware
- [ ] Routes mapped to correct controller functions
- [ ] Exports module correctly

#### 3.2 Server Integration (UPDATE - IMPLEMENT)
**File:** `/home/minipc/Desktop/minichat/backend/src/server.js`
**Status:** ⏳ Needs route addition

**Required Changes:**
1. Add line: `const conversationRoutes = require('./routes/conversation');`
2. Add line: `app.use('/api/conversations', conversationRoutes);`

**Validation:**
- [ ] Server starts without errors
- [ ] Route accessible: `curl http://localhost:5000/api/conversations` returns 401 (needs auth)
- [ ] No conflicts with existing routes

---

### Phase 4: Socket.io Integration (OPTIONAL - Can skip for MVP)

#### 4.1 Install Dependencies
```bash
cd /home/minipc/Desktop/minichat/backend
npm install socket.io
```

#### 4.2 Update Server with Socket.io
**File:** `/home/minipc/Desktop/minichat/backend/src/server.js`

**Changes Needed:**
```javascript
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Make io available in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket handlers
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_workspace', (workspaceId) => {
        socket.join(`workspace_${workspaceId}`);
    });

    socket.on('join_session', (sessionId) => {
        socket.join(`session_${sessionId}`);
    });

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Change app.listen to server.listen
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

**Validation:**
- [ ] Socket.io dependency installed
- [ ] Server starts with Socket.io
- [ ] Can connect from frontend: `io('http://localhost:5000')`

---

## 🧪 Testing Plan

### Test 1: Basic Flow
```bash
# 1. Start server
cd /home/minipc/Desktop/minichat/backend
npm run dev

# 2. Get token (login first)
TOKEN="your_jwt_token_here"

# 3. Test conversation listing
curl -X GET http://localhost:5000/api/conversations \
  -H "Authorization: Bearer $TOKEN"

# Expected: { success: true, conversations: [] }
```

### Test 2: Takeover Flow
```bash
# 1. Create a conversation (send message from widget)
# This happens automatically when customer sends first message

# 2. List conversations to get sessionId
curl -X GET http://localhost:5000/api/conversations \
  -H "Authorization: Bearer $TOKEN"

# 3. Takeover conversation
curl -X POST http://localhost:5000/api/conversations/sess_abc123/takeover \
  -H "Authorization: Bearer $TOKEN"

# Expected: { success: true, message: "Successfully took over...", conversation: {...} }

# 4. Check conversation mode changed to 'human'
curl -X GET http://localhost:5000/api/conversations/sess_abc123 \
  -H "Authorization: Bearer $TOKEN"

# Expected: conversation.mode === 'human', conversation.botPaused === true
```

### Test 3: Send Human Message
```bash
curl -X POST http://localhost:5000/api/conversations/sess_abc123/message \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "สวัสดีครับ ผมจะช่วยคุณเองนะครับ",
    "type": "text"
  }'

# Expected: { success: true, message: {...} }
```

### Test 4: End Human Session
```bash
curl -X POST http://localhost:5000/api/conversations/sess_abc123/end \
  -H "Authorization: Bearer $TOKEN"

# Expected: conversation.mode === 'bot', conversation.botMode === 'passive'
```

### Test 5: Bot Passive Mode
```bash
# Customer sends message without question mark
# Expected: Bot doesn't respond

# Customer sends message with question mark
# Expected: Bot responds and becomes active again
```

### Test 6: Get Statistics
```bash
curl -X GET http://localhost:5000/api/conversations/stats \
  -H "Authorization: Bearer $TOKEN"

# Expected: {
#   success: true,
#   stats: {
#     total: 5,
#     active: 2,
#     botHandled: 3,
#     humanHandled: 1,
#     resolved: 1
#   }
# }
```

---

## ✅ Acceptance Criteria

### Must Have (MVP):
- [x] Conversation model created and working
- [ ] All controller functions implemented and tested
- [ ] Routes integrated into server
- [ ] Bot stops responding when human takes over
- [ ] Bot passive mode works after human ends session
- [ ] Can list conversations
- [ ] Can view conversation details with messages
- [ ] Can send message as human agent

### Nice to Have (Phase 2):
- [ ] Socket.io real-time notifications
- [ ] Browser notifications when customer messages
- [ ] Sound alerts
- [ ] Assign conversation to specific agent
- [ ] Canned responses (quick replies)

---

## 🚨 Critical Requirements

1. **No Breaking Changes**
   - Existing chat functionality MUST continue working
   - Existing API endpoints MUST remain functional
   - Widget MUST still work as before

2. **Error Handling**
   - All endpoints must have try-catch
   - Return proper HTTP status codes
   - Log errors to console

3. **Authentication**
   - All conversation routes MUST use `protect` middleware
   - Verify workspace ownership
   - Prevent access to other workspaces' conversations

4. **Database Indexes**
   - Conversation model has proper indexes
   - Queries are optimized
   - No N+1 query problems

---

## 📁 Files Summary

### Files Already Created (Need Testing):
1. `/home/minipc/Desktop/minichat/backend/src/models/Conversation.js` ✅
2. `/home/minipc/Desktop/minichat/backend/src/controllers/conversationController.js` ✅
3. `/home/minipc/Desktop/minichat/backend/src/routes/conversation.js` ✅

### Files Need Updating:
1. `/home/minipc/Desktop/minichat/backend/src/models/Message.js` ✅ (Already done)
2. `/home/minipc/Desktop/minichat/backend/src/controllers/chatController.js` ⏳ (Partially done)
3. `/home/minipc/Desktop/minichat/backend/src/server.js` ⏳ (Need to add route)

### Files to Create (Optional):
1. Socket.io integration in server.js
2. Frontend dashboard (separate task)

---

## 🎯 Implementation Priority

### Priority 1 (Do First):
1. Update `server.js` to add conversation routes
2. Test all conversation API endpoints
3. Complete chat controller updates for mode checking
4. Test bot pause when human takes over
5. Test bot passive mode

### Priority 2 (Do After Testing):
1. Socket.io integration
2. Real-time notifications
3. Frontend dashboard

---

## 💡 Tips for Ralph

1. **Start with server.js**
   - Just add 2 lines to register the route
   - Test that routes are accessible

2. **Test incrementally**
   - Test each endpoint one by one
   - Use curl or Postman
   - Don't move to next until current works

3. **Complete chat controller logic**
   - The conversation checking code is partially added
   - Make sure it's in the right place in sendMessage function
   - Test bot doesn't respond in human mode

4. **Check existing code**
   - Don't break existing functionality
   - Run existing tests if any
   - Test widget still works

5. **Handle edge cases**
   - What if conversation doesn't exist?
   - What if wrong user tries to take over?
   - What if database save fails?

---

## 🔍 How to Verify Success

Run this complete test:

```bash
# 1. Server starts
npm run dev
# ✅ No errors

# 2. Routes registered
curl http://localhost:5000/api/conversations
# ✅ Returns 401 (needs auth) - means route exists

# 3. With auth, list conversations
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/conversations
# ✅ Returns { success: true, conversations: [...] }

# 4. Send message as customer (from widget)
# ✅ Bot responds normally

# 5. Admin takes over
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/conversations/sess_xxx/takeover
# ✅ Returns success

# 6. Send message as customer again
# ✅ Bot DOES NOT respond (stays silent)

# 7. Admin sends message
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi, I will help you"}' \
  http://localhost:5000/api/conversations/sess_xxx/message
# ✅ Message created with role='human'

# 8. Admin ends session
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/conversations/sess_xxx/end
# ✅ Bot mode becomes 'passive'

# 9. Customer sends regular message (no question)
# ✅ Bot stays silent

# 10. Customer asks question "How much?"
# ✅ Bot responds and becomes active again
```

---

## 📚 Reference Documents

- Implementation Plan: `/home/minipc/Desktop/minichat/LIVE_CHAT_IMPLEMENTATION.md`
- Architecture Plan: `/home/minipc/Desktop/minichat/CHATBOT_ARCHITECTURE_PLAN.md`
- Quick Start: `/home/minipc/Desktop/minichat/QUICK_START_GUIDE.md`

---

**Ready to implement! 🚀**

All files are created, just need:
1. Integration (2 lines in server.js)
2. Testing
3. Bug fixes if any

**Estimated Time:** 30-60 minutes for complete testing and verification.

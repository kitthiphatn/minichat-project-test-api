# 🚀 MiniChat SaaS Platform - Complete Implementation Plan

## 📋 Project Context

**Project:** MiniChat SaaS Platform - AI Chatbot Widget as a Service
**Goal:** Complete MVP for beta launch with 10 users
**Target Market:** International (US/UK/AU) + Thailand
**Tech Stack:** Node.js, Express, MongoDB, Next.js 14, Groq AI

---

## 🎯 Current Status Analysis

### ✅ Completed Components
1. **Widget** - Production-ready chatbot widget (HTML/JS)
2. **Backend API** - Express.js with multi-AI provider support
3. **Frontend Auth Page** - Glassmorphism design with login/register
4. **Backend Auth System** - User & Workspace models, JWT middleware
5. **OAuth Integration** - Google & GitHub login (controllers ready)

### ❌ Missing Components
1. **Dashboard** - User workspace management interface
2. **Multi-tenant Architecture** - Workspace isolation & API key management
3. **Usage Tracking** - Message counting & limits per plan
4. **Stripe Billing** - Subscription management
5. **Widget Customization UI** - Branding & behavior settings
6. **Testing & Validation** - End-to-end integration tests
7. **Deployment** - Production environment setup

---

## 🔄 Ralph Loop Implementation Plan

### Phase 1: Foundation & Integration Testing (Priority 1)

**Task 1.1: Verify Auth System Integration**
- Test frontend auth page connects to backend successfully
- Verify registration creates User + Workspace in MongoDB
- Test login returns JWT token and user data
- Test protected routes with JWT middleware
- Fix any CORS or connection issues

**Validation:**
```bash
# Backend running on http://localhost:5000
# Frontend running on http://localhost:3000
# Test registration and login flows manually
# Check MongoDB for created records
```

**Task 1.2: Create Dashboard Layout & Navigation**
- Create `/app/dashboard` route in Next.js
- Build sidebar navigation (Dashboard, Widgets, Settings, Billing)
- Add protected route middleware (check JWT token)
- Create logout functionality
- Add user profile display in navbar

**Validation:**
- Can access dashboard after login
- Redirects to /auth if not logged in
- User info displays correctly
- Logout clears token and redirects

---

### Phase 2: Multi-Tenant Architecture (Priority 2)

**Task 2.1: Workspace Management**
- Create workspace switcher component
- Add "Create New Workspace" functionality
- Display workspace list from user's workspaces array
- Update API calls to include workspaceId header
- Add workspace settings page (name, description)

**Task 2.2: Widget API Key System**
- Generate unique API key per workspace
- Create `/api/workspaces/:id/regenerate-key` endpoint
- Update widget to authenticate with API key instead of session ID
- Add API key display in dashboard (with copy button)
- Add API key validation middleware for chat endpoint

**Validation:**
```bash
# Test creating multiple workspaces
# Verify each workspace has unique API key
# Test widget works with API key
# Verify API key regeneration works
```

---

### Phase 3: Usage Tracking & Limits (Priority 3)

**Task 3.1: Message Counter System**
- Add `messageCount` and `monthlyMessageLimit` to Workspace model
- Update chat controller to increment messageCount
- Add middleware to check if limit exceeded before processing
- Create monthly reset cron job (or check last reset date)
- Display usage stats in dashboard (e.g., "2,450 / 15,000 messages")

**Task 3.2: Plan Management**
- Add `plan` field to Workspace model (free/starter/pro/business)
- Create plan limits configuration:
  ```javascript
  const PLANS = {
    free: { limit: 250, price: 0 },
    starter: { limit: 2500, price: 19 },
    pro: { limit: 15000, price: 49 },
    business: { limit: 75000, price: 149 }
  };
  ```
- Add plan upgrade/downgrade UI in dashboard
- Show current plan badge in sidebar

**Validation:**
```bash
# Create workspace with free plan
# Send 250+ messages and verify it blocks at limit
# Upgrade to starter plan manually in DB
# Verify new limit is 2,500
```

---

### Phase 4: Widget Customization (Priority 4)

**Task 4.1: Widget Settings Model**
- Create WidgetSettings schema (or embed in Workspace):
  - `primaryColor` (hex color)
  - `botName` (string)
  - `welcomeMessage` (string)
  - `position` (bottom-right / bottom-left)
  - `botAvatar` (URL or emoji)
  - `companyName` (string)

**Task 4.2: Widget Customization UI**
- Create `/dashboard/widgets/[id]/customize` page
- Add color picker for primary color
- Add text inputs for bot name, welcome message
- Add position toggle (left/right)
- Live preview of widget with changes
- Save button to update WidgetSettings

**Task 4.3: Widget Dynamic Configuration**
- Create `/api/widgets/:apiKey/config` endpoint
- Widget fetches config on initialization
- Widget applies custom colors, name, message dynamically
- Add embed code generator in dashboard:
  ```html
  <script src="https://api.clubfivem.com/widget.js"
          data-api-key="YOUR_API_KEY"></script>
  ```

**Validation:**
- Change widget color in dashboard → preview updates
- Copy embed code → test on demo HTML page
- Verify widget loads with custom settings

---

### Phase 5: Stripe Billing Integration (Priority 5)

**Task 5.1: Stripe Setup**
- Install `stripe` package: `npm install stripe`
- Create Stripe account and get API keys
- Add `STRIPE_SECRET_KEY` to backend `.env`
- Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to frontend `.env`
- Create Stripe products for each plan in Stripe Dashboard

**Task 5.2: Subscription Flow (Backend)**
- Create `/api/billing/create-checkout-session` endpoint
- Create `/api/billing/webhook` for Stripe events
- Handle `checkout.session.completed` event (upgrade plan)
- Handle `invoice.payment_failed` event (downgrade to free)
- Add `stripeCustomerId` and `stripeSubscriptionId` to Workspace model

**Task 5.3: Subscription Flow (Frontend)**
- Create "Upgrade Plan" button in dashboard
- Redirect to Stripe Checkout on button click
- Add success/cancel redirect URLs
- Show current subscription status
- Add "Manage Billing" link (Stripe Customer Portal)

**Validation:**
```bash
# Click "Upgrade to Starter"
# Complete payment in Stripe Checkout (use test card 4242 4242 4242 4242)
# Verify workspace.plan updates to "starter"
# Verify messageLimit updates to 2,500
# Check Stripe dashboard for subscription
```

---

### Phase 6: Production Polish (Priority 6)

**Task 6.1: Error Handling & Loading States**
- Add loading spinners to all async operations
- Add error toasts/notifications for failed requests
- Add empty states (e.g., "No workspaces yet")
- Add confirmation modals for destructive actions
- Improve form validation with error messages

**Task 6.2: Analytics & Monitoring**
- Add message history table in dashboard
- Show conversation analytics (total messages, active sessions)
- Add date range filter for analytics
- Create simple charts (messages per day)

**Task 6.3: Documentation & Onboarding**
- Create onboarding flow for new users
- Add help tooltips in dashboard
- Create widget installation guide
- Add FAQ page
- Create demo video/GIF

**Task 6.4: Testing**
- Test all auth flows (register, login, OAuth)
- Test workspace creation and switching
- Test widget with different customizations
- Test message limits and plan upgrades
- Test Stripe subscription flow end-to-end
- Fix any bugs discovered

---

## 🎯 Ralph Loop Execution Strategy

### Iteration Guidelines
1. **Work in small, testable increments** - Complete one task before moving to next
2. **Test after each task** - Run validation commands and manual tests
3. **Fix bugs immediately** - Don't move forward with broken features
4. **Commit frequently** - Git commit after each completed task
5. **Update progress.txt** - Document completion of each phase

### Success Criteria (Per Task)
- Code runs without errors
- Validation tests pass
- Feature works as described in plan
- No console errors in browser/terminal
- MongoDB data structure is correct

### Completion Signal
When ALL phases are complete and validated, output:
```
<promise>MVP_COMPLETE</promise>
```

---

## 🛠️ Technical Reference

### Environment Variables Needed

**Backend (.env):**
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-chat-ollama
GROQ_API_KEY=gsk_xxx
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Database Models Overview

1. **User** - email, password, username, workspaces[]
2. **Workspace** - name, owner, apiKey, plan, messageCount, monthlyMessageLimit, stripeCustomerId, stripeSubscriptionId
3. **Message** - workspaceId, sessionId, role, content, timestamp
4. **WidgetSettings** (embedded in Workspace or separate) - customization options

### API Endpoints to Create

```
Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/google/url
- POST /api/auth/google
- GET /api/auth/github/url
- POST /api/auth/github

Workspaces:
- GET /api/workspaces (list user's workspaces)
- POST /api/workspaces (create new)
- GET /api/workspaces/:id
- PUT /api/workspaces/:id (update settings)
- POST /api/workspaces/:id/regenerate-key
- DELETE /api/workspaces/:id

Widget:
- GET /api/widgets/:apiKey/config (get customization)
- PUT /api/widgets/:apiKey/config (update customization)

Chat (existing, needs update):
- POST /api/chat/message (add API key auth)

Billing:
- POST /api/billing/create-checkout-session
- POST /api/billing/webhook
- POST /api/billing/portal-session

Analytics:
- GET /api/analytics/messages (message history)
- GET /api/analytics/stats (usage statistics)
```

---

## 📊 Validation Checklist

Before outputting `<promise>MVP_COMPLETE</promise>`, verify:

### Core Functionality
- [ ] User can register with email/password
- [ ] User can login with email/password
- [ ] User can login with Google OAuth
- [ ] User can login with GitHub OAuth
- [ ] User redirects to dashboard after login
- [ ] User can logout and session clears

### Workspace Management
- [ ] New user gets default workspace created
- [ ] User can create additional workspaces
- [ ] User can switch between workspaces
- [ ] Each workspace has unique API key
- [ ] User can regenerate API key

### Widget Integration
- [ ] Widget loads on external HTML page
- [ ] Widget authenticates with API key
- [ ] Widget sends and receives messages
- [ ] Widget respects usage limits
- [ ] Widget shows custom branding (color, name, message)

### Usage & Billing
- [ ] Message counter increments correctly
- [ ] Free plan blocks at 250 messages
- [ ] User can upgrade plan via Stripe
- [ ] Plan upgrade increases message limit
- [ ] Usage stats display in dashboard
- [ ] Stripe webhook updates workspace plan

### Polish & UX
- [ ] All pages are responsive (mobile-friendly)
- [ ] Loading states show during async operations
- [ ] Error messages display for failed operations
- [ ] Form validation works correctly
- [ ] No console errors in browser
- [ ] No server errors in backend logs

---

## 🚨 Important Notes

1. **Don't skip validation** - Test each task before moving to next
2. **MongoDB must be running** - Start with `mongod` before testing
3. **Use test Stripe keys** - Don't use live keys during development
4. **Test in incognito** - Verify auth flows work without cached tokens
5. **Git commit often** - Save progress after each completed task

---

## 🎯 Ralph Loop Configuration

**Max Iterations:** 100
**Completion Promise:** MVP_COMPLETE
**Estimated Time:** 2-3 days of continuous development

---

*Plan created: 2026-01-24*
*Last updated: 2026-01-24*

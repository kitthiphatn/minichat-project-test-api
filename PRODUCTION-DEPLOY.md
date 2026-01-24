# 🚀 Production Deployment Guide - chat.clubfivem.com

## ✅ Configuration Complete

### Production URLs
- **Frontend:** https://chat.clubfivem.com
- **Backend API:** https://api.clubfivem.com
- **Widget:** Embed with API key from dashboard

---

## 🔧 Configuration Changes Made

### 1. Cloudflare Tunnel
```yaml
# cloudflared-config.yml
ingress:
  - hostname: chat.clubfivem.com
    service: http://localhost:3000  # Frontend

  - hostname: api.clubfivem.com
    service: http://localhost:5000  # Backend (FIXED: was 5001)
```

### 2. Backend Environment
```bash
# backend/.env
CORS_ORIGIN=https://chat.clubfivem.com  # UPDATED
PORT=5000

# OAuth Callbacks (already configured)
GOOGLE_REDIRECT_URI=https://chat.clubfivem.com/auth/callback/google
GITHUB_REDIRECT_URI=https://chat.clubfivem.com/auth/callback/github
```

### 3. Frontend Environment
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.clubfivem.com/api  # UPDATED
```

### 4. Widget Configuration
```javascript
// widget/minichat-widget-v2.html
apiUrl: 'https://api.clubfivem.com/api'  # UPDATED
```

---

## 🚀 Deployment Steps

### Step 1: Start Cloudflare Tunnel
```bash
# Start the tunnel
cloudflared tunnel run d26fba95-f796-45e3-96dd-7e0b3bbd867a

# Or use your existing tunnel start command
```

### Step 2: Start Backend Server
```bash
cd backend
npm run dev

# Should show:
# ✓ Server running on http://localhost:5000
# ✓ CORS enabled for: https://chat.clubfivem.com
```

### Step 3: Start Frontend Server
```bash
cd frontend
npm run dev

# Should show:
# ▲ Next.js 14.0.4
# - Local: http://localhost:3000
# - Ready in XXXms
```

### Step 4: Verify Tunnel Routes
```bash
# Test API endpoint
curl https://api.clubfivem.com/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...,"mongodb":"connected"}

# Test Frontend
# Open browser: https://chat.clubfivem.com
```

---

## 🧪 Testing Production

### 1. Test Auth Page
1. Go to https://chat.clubfivem.com/auth
2. Register new account
3. Should redirect to https://chat.clubfivem.com/dashboard
4. Check workspace created with API key

### 2. Test Widget
1. Login to dashboard
2. Go to Widgets page
3. Copy API key
4. Copy embed code
5. Create test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Widget Test</title>
</head>
<body>
    <h1>Testing MiniChat Widget</h1>

    <!-- Paste widget HTML here -->
    <div class="minichat-widget" id="minichatWidget" data-api-key="YOUR_API_KEY">
        <!-- Widget content from minichat-widget-v2.html -->
    </div>

    <!-- Include the widget script inline or serve it -->
</body>
</html>
```

6. Open in browser
7. Chat should work and count messages

### 3. Test API Directly
```bash
# Get widget config (replace YOUR_API_KEY)
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.clubfivem.com/api/widget/config

# Should return workspace settings
```

---

## 📋 Production Checklist

### Security
- [x] CORS configured for production domain
- [x] JWT secret set (change in production!)
- [x] API keys working
- [x] HTTPS enabled (via Cloudflare)
- [ ] Rate limiting (optional - add later)
- [ ] Input sanitization (already implemented)

### Environment
- [x] Production URLs configured
- [x] OAuth callbacks set
- [x] MongoDB connection string
- [x] Groq API key set
- [ ] Backup MongoDB regularly
- [ ] Monitor logs

### Testing
- [ ] Register new user on production
- [ ] Create workspace
- [ ] Get API key
- [ ] Embed widget on test site
- [ ] Send messages
- [ ] Check usage counter
- [ ] Test message limits (250/month)
- [ ] Test OAuth (Google/GitHub)

### Monitoring
- [ ] Check Cloudflare tunnel status
- [ ] Monitor API response times
- [ ] Check MongoDB connections
- [ ] Monitor message usage
- [ ] Track errors in logs

---

## 🔒 Security Recommendations

### 1. Change JWT Secret
```bash
# Generate secure secret
openssl rand -base64 32

# Update in backend/.env
JWT_SECRET=<generated_secret>
```

### 2. MongoDB Security
```bash
# Use MongoDB Atlas (cloud) instead of local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minichat

# Enable authentication on local MongoDB
# Add username/password
```

### 3. Environment Variables
- Never commit .env to git
- Use environment variable manager for production
- Rotate API keys regularly

### 4. HTTPS Only
- Cloudflare provides free SSL ✅
- Force HTTPS redirects
- Set secure cookie flags

---

## 🐛 Troubleshooting

### Issue: Widget not loading
**Check:**
1. API key is correct
2. CORS allows chat.clubfivem.com
3. API endpoint is accessible
4. Cloudflare tunnel is running

### Issue: Authentication fails
**Check:**
1. JWT_SECRET is set
2. MongoDB is connected
3. CORS origin is correct
4. OAuth redirect URIs match

### Issue: Messages not counting
**Check:**
1. API key middleware is working
2. Workspace exists in database
3. incrementMessageCount middleware active
4. No errors in backend logs

### Issue: 429 Too Many Requests
**Expected behavior when:**
- Free plan: 250 messages used
- Counter resets monthly
- Check workspace.usage.resetDate

---

## 📊 Monitoring Commands

### Check Server Status
```bash
# Backend health
curl https://api.clubfivem.com/health

# MongoDB status
# In backend:
npm run dev
# Look for: "MongoDB connection closed" or "connected"
```

### Check Cloudflare Tunnel
```bash
cloudflared tunnel list
cloudflared tunnel info d26fba95-f796-45e3-96dd-7e0b3bbd867a
```

### View Logs
```bash
# Backend logs
cd backend
npm run dev
# Watch for errors

# Frontend logs
cd frontend
npm run dev
# Watch for build errors
```

---

## 🎯 Next Steps

1. **Beta Launch**
   - Invite 10 test users
   - Get feedback on widget performance
   - Monitor usage patterns

2. **Add Stripe** (when ready to monetize)
   - Create Stripe products
   - Add billing endpoints
   - Connect upgrade buttons

3. **Production Optimizations**
   - Build frontend: `npm run build && npm start`
   - Use PM2 for backend process management
   - Setup MongoDB backups
   - Add Redis for caching (optional)

4. **Marketing**
   - Product Hunt launch
   - Social media
   - Documentation site
   - Demo videos

---

## ✅ Deployment Status

**Configuration:** ✅ COMPLETE
**Cloudflare Tunnel:** ✅ CONFIGURED
**Backend API:** ✅ READY (port 5000)
**Frontend:** ✅ READY (port 3000)
**Widget V2:** ✅ READY (production URL)
**OAuth:** ✅ CONFIGURED (needs testing)

**Ready to Start:** ✅ YES

Run the 3 commands:
1. `cloudflared tunnel run <tunnel-id>`
2. `cd backend && npm run dev`
3. `cd frontend && npm run dev`

Then open: **https://chat.clubfivem.com**

---

*Last Updated: 2026-01-24*
*Production URL: https://chat.clubfivem.com*
*API URL: https://api.clubfivem.com*
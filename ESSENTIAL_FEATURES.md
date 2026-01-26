# 🎯 Essential Features - ฟีเจอร์ที่จำเป็นต้องมีเพิ่ม

> วิเคราะห์จาก SaaS Chat Platform ที่ทำงานได้จริง

---

## 🔥 Critical Missing Features (ต้องมีก่อนเปิดใช้งานจริง)

### 1. Payment Gateway Integration ⭐⭐⭐⭐⭐
**Current Status:** Mock payment only

**Why Critical:**
- ไม่มี revenue = ไม่ใช่ SaaS ที่สมบูรณ์
- Users ไม่สามารถ upgrade plan ได้จริง
- ขาด recurring billing

**Implementation:**

#### Option A: Stripe (International)
```bash
npm install stripe
```

```javascript
// backend/src/services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
    // Create checkout session
    async createCheckoutSession(userId, workspaceId, plan, billingPeriod) {
        const prices = {
            starter: {
                monthly: 'price_starter_monthly',
                yearly: 'price_starter_yearly'
            },
            pro: {
                monthly: 'price_pro_monthly',
                yearly: 'price_pro_yearly'
            },
            business: {
                monthly: 'price_business_monthly',
                yearly: 'price_business_yearly'
            }
        };

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price: prices[plan][billingPeriod],
                quantity: 1,
            }],
            success_url: `${process.env.FRONTEND_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/billing`,
            client_reference_id: workspaceId,
            metadata: {
                userId,
                workspaceId,
                plan,
                billingPeriod,
            },
        });

        return session;
    }

    // Handle webhook
    async handleWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handlePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionCanceled(event.data.object);
                break;
        }
    }

    async handleCheckoutCompleted(session) {
        const { workspaceId, plan } = session.metadata;

        // Update workspace
        await Workspace.findByIdAndUpdate(workspaceId, {
            plan,
            'usage.messagesLimit': this.getPlanLimit(plan),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
        });

        // Create transaction record
        await PaymentTransaction.create({
            workspace: workspaceId,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'completed',
            provider: 'stripe',
            plan,
            stripeSessionId: session.id,
        });
    }

    getPlanLimit(plan) {
        const limits = {
            free: 250,
            starter: 2000,
            pro: 10000,
            business: 50000,
        };
        return limits[plan];
    }
}

module.exports = new StripeService();
```

#### Option B: PromptPay (Thailand)
```javascript
// backend/src/services/promptpayService.js
const QRCode = require('qrcode');
const { generatePayload } = require('promptpay-qr');

class PromptPayService {
    async generateQR(amount, ref1, ref2) {
        const promptpayId = process.env.PROMPTPAY_ID; // เบอร์โทร/Tax ID
        const payload = generatePayload(promptpayId, { amount });
        const qrCodeImage = await QRCode.toDataURL(payload);

        return {
            qrCode: qrCodeImage,
            amount,
            ref1,
            ref2,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        };
    }

    // Manual verification (ต้องเช็ค bank statement)
    async verifyPayment(transactionId, slipImage) {
        // Option 1: Manual admin approval
        // Option 2: Use SCB/KBank API for auto verification
        // Option 3: Use third-party slip verification service
    }
}

module.exports = new PromptPayService();
```

**Routes:**
```javascript
// backend/src/routes/payment.js
const stripeService = require('../services/stripeService');

// Create checkout
router.post('/checkout', protect, async (req, res) => {
    const { plan, billingPeriod } = req.body;
    const session = await stripeService.createCheckoutSession(
        req.user._id,
        req.workspace._id,
        plan,
        billingPeriod
    );
    res.json({ checkoutUrl: session.url });
});

// Stripe webhook
router.post('/webhook/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        await stripeService.handleWebhook(event);
        res.json({ received: true });
    }
);

// PromptPay QR
router.post('/promptpay/generate', protect, async (req, res) => {
    const { plan, billingPeriod } = req.body;
    const amount = calculateAmount(plan, billingPeriod);
    const qr = await promptpayService.generateQR(
        amount,
        req.workspace._id,
        Date.now()
    );
    res.json(qr);
});

// Upload slip
router.post('/promptpay/verify', protect, upload.single('slip'), async (req, res) => {
    const { transactionId } = req.body;
    const result = await promptpayService.verifyPayment(
        transactionId,
        req.file.path
    );
    res.json(result);
});
```

---

### 2. Email System (Transactional Emails) ⭐⭐⭐⭐⭐
**Current Status:** Partial (OTP only)

**Missing:**
- Welcome email
- Payment confirmation
- Invoice emails
- Usage alerts (90% quota)
- Team invitations
- Password changed notification

**Implementation:**
```bash
npm install nodemailer mjml @sendgrid/mail
```

```javascript
// backend/src/services/emailService.js
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.useSendGrid = true;
        } else {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                }
            });
            this.useSendGrid = false;
        }
    }

    async sendWelcomeEmail(user, workspace) {
        const template = `
            <h1>Welcome to MiniChat! 🎉</h1>
            <p>Hi ${user.username},</p>
            <p>Your account has been created successfully.</p>
            <p><strong>Workspace:</strong> ${workspace.name}</p>
            <p><strong>API Key:</strong> ${workspace.apiKey}</p>
            <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>
        `;

        await this.send({
            to: user.email,
            subject: 'Welcome to MiniChat!',
            html: template,
        });
    }

    async sendPaymentConfirmation(user, transaction) {
        const template = `
            <h1>Payment Confirmed</h1>
            <p>Hi ${user.username},</p>
            <p>Your payment has been processed successfully.</p>
            <ul>
                <li>Plan: ${transaction.plan}</li>
                <li>Amount: ${transaction.amount} ${transaction.currency}</li>
                <li>Date: ${transaction.createdAt}</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/dashboard/billing">View Invoice</a>
        `;

        await this.send({
            to: user.email,
            subject: 'Payment Confirmation',
            html: template,
        });
    }

    async sendQuotaAlert(user, workspace, percentage) {
        const template = `
            <h1>⚠️ Quota Alert</h1>
            <p>Hi ${user.username},</p>
            <p>Your workspace <strong>${workspace.name}</strong> has used ${percentage}% of monthly quota.</p>
            <p>Messages used: ${workspace.usage.messagesThisMonth} / ${workspace.usage.messagesLimit}</p>
            <a href="${process.env.FRONTEND_URL}/dashboard/billing">Upgrade Plan</a>
        `;

        await this.send({
            to: user.email,
            subject: `Quota Alert: ${percentage}% Used`,
            html: template,
        });
    }

    async sendTeamInvitation(email, workspace, invitedBy, inviteToken) {
        const template = `
            <h1>Team Invitation</h1>
            <p>${invitedBy.username} invited you to join <strong>${workspace.name}</strong></p>
            <a href="${process.env.FRONTEND_URL}/invite/${inviteToken}">Accept Invitation</a>
        `;

        await this.send({
            to: email,
            subject: `Invitation to join ${workspace.name}`,
            html: template,
        });
    }

    async send({ to, subject, html }) {
        if (this.useSendGrid) {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject,
                html,
            });
        } else {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                html,
            });
        }
    }
}

module.exports = new EmailService();
```

**Usage:**
```javascript
// After user registration
await emailService.sendWelcomeEmail(user, workspace);

// After payment
await emailService.sendPaymentConfirmation(user, transaction);

// Check quota (in middleware)
if (workspace.usage.messagesThisMonth / workspace.usage.messagesLimit > 0.9) {
    await emailService.sendQuotaAlert(user, workspace, 90);
}
```

---

### 3. Live Chat (Real-time) ⭐⭐⭐⭐
**Current Status:** Polling only

**Why Needed:**
- Real-time updates for dashboard
- Live notifications
- Better UX

**Implementation:**
```bash
npm install socket.io
```

```javascript
// backend/src/socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
    initialize(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS.split(','),
                credentials: true,
            }
        });

        // Authentication middleware
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.id;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);

            // Join workspace room
            socket.on('join-workspace', (workspaceId) => {
                socket.join(`workspace:${workspaceId}`);
            });

            // Join chat session
            socket.on('join-session', (sessionId) => {
                socket.join(`session:${sessionId}`);
            });

            // Typing indicator
            socket.on('typing', (sessionId) => {
                socket.to(`session:${sessionId}`).emit('user-typing');
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.userId}`);
            });
        });
    }

    // Emit new message to session
    emitNewMessage(sessionId, message) {
        this.io.to(`session:${sessionId}`).emit('new-message', message);
    }

    // Emit notification to user
    emitNotification(userId, notification) {
        this.io.to(`user:${userId}`).emit('notification', notification);
    }

    // Emit quota alert
    emitQuotaAlert(workspaceId, alert) {
        this.io.to(`workspace:${workspaceId}`).emit('quota-alert', alert);
    }
}

module.exports = new SocketService();
```

**Server Integration:**
```javascript
// backend/src/server.js
const http = require('http');
const socketService = require('./socket');

const server = http.createServer(app);
socketService.initialize(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log('✓ Socket.IO initialized');
});
```

**Frontend:**
```javascript
// frontend/src/lib/socket.js
import { io } from 'socket.io-client';

class SocketClient {
    connect(token) {
        this.socket = io(process.env.NEXT_PUBLIC_API_URL, {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('new-message', (message) => {
            // Update UI
        });

        this.socket.on('notification', (notification) => {
            // Show notification
        });
    }

    joinWorkspace(workspaceId) {
        this.socket.emit('join-workspace', workspaceId);
    }

    sendTyping(sessionId) {
        this.socket.emit('typing', sessionId);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

export default new SocketClient();
```

---

### 4. Admin Dashboard (Full-Featured) ⭐⭐⭐⭐
**Current Status:** Basic stats only

**Missing:**
- User management (edit, suspend, delete)
- Workspace management
- System settings
- Revenue analytics
- Support tickets
- Audit logs viewer

**Implementation:**
```javascript
// backend/src/controllers/adminController.js

// Enhanced stats
exports.getStats = async (req, res) => {
    const stats = {
        overview: {
            totalUsers: await User.countDocuments(),
            activeUsers: await User.countDocuments({
                lastLoginAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
            }),
            totalWorkspaces: await Workspace.countDocuments(),
            totalMessages: await Message.countDocuments(),
        },
        revenue: {
            mrr: await calculateMRR(), // Monthly Recurring Revenue
            arr: await calculateARR(), // Annual Recurring Revenue
            totalRevenue: await getTotalRevenue(),
            revenueByPlan: await getRevenueByPlan(),
        },
        usage: {
            messagesByProvider: await Message.aggregate([
                { $group: { _id: '$provider', count: { $sum: 1 } } }
            ]),
            averageResponseTime: await getAverageResponseTime(),
            peakHours: await getPeakUsageHours(),
        },
        growth: {
            newUsersThisMonth: await getNewUsersCount(30),
            newUsersLastMonth: await getNewUsersCount(60, 30),
            churnRate: await calculateChurnRate(),
            growthRate: await calculateGrowthRate(),
        }
    };

    res.json({ stats });
};

// Suspend user
exports.suspendUser = async (req, res) => {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    const user = await User.findByIdAndUpdate(userId, {
        suspended: true,
        suspensionReason: reason,
        suspendedUntil: duration ? new Date(Date.now() + duration) : null,
    });

    // Log activity
    await ActivityLog.create({
        user: req.user._id,
        action: 'SUSPEND_USER',
        details: { targetUser: userId, reason },
    });

    res.json({ message: 'User suspended', user });
};

// System settings
exports.updateSystemSettings = async (req, res) => {
    const { key, value } = req.body;

    const setting = await SystemSetting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
    );

    res.json({ setting });
};

// Export data
exports.exportData = async (req, res) => {
    const { type, format } = req.query; // type: users, workspaces, messages

    let data;
    switch(type) {
        case 'users':
            data = await User.find().lean();
            break;
        case 'workspaces':
            data = await Workspace.find().populate('owner').lean();
            break;
        case 'messages':
            data = await Message.find().lean();
            break;
    }

    if (format === 'csv') {
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}.csv`);
        res.send(csv);
    } else {
        res.json(data);
    }
};
```

---

### 5. Contact Form / Lead Capture ⭐⭐⭐⭐
**Current Status:** Chat only

**Why Needed:**
- Capture leads even when offline
- Get email/phone for follow-up
- Better conversion tracking

**Implementation:**
```javascript
// backend/src/models/Lead.js
const leadSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
    },
    name: String,
    email: String,
    phone: String,
    company: String,
    message: String,
    sessionId: String,
    source: {
        type: String,
        enum: ['widget', 'landing-page', 'contact-form'],
        default: 'widget'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
        default: 'new'
    },
    tags: [String],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: [{
        text: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    metadata: {
        ip: String,
        userAgent: String,
        referrer: String,
        country: String,
        city: String,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', leadSchema);
```

```javascript
// backend/src/routes/leads.js
router.post('/capture', optionalApiKey, async (req, res) => {
    const { name, email, phone, message, sessionId } = req.body;

    const lead = await Lead.create({
        workspace: req.workspace._id,
        name,
        email,
        phone,
        message,
        sessionId,
        source: 'widget',
        metadata: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            referrer: req.headers['referer'],
        }
    });

    // Send notification to workspace owner
    const workspace = await Workspace.findById(req.workspace._id).populate('owner');
    await emailService.sendNewLeadNotification(workspace.owner, lead);

    // Emit real-time notification
    socketService.emitNotification(workspace.owner._id, {
        type: 'new-lead',
        lead,
    });

    res.json({ success: true, leadId: lead._id });
});

// Get leads
router.get('/', protect, async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { workspace: req.workspace._id };
    if (status) query.status = status;

    const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('assignedTo');

    const total = await Lead.countDocuments(query);

    res.json({
        leads,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        }
    });
});

// Update lead status
router.put('/:id/status', protect, async (req, res) => {
    const { status, note } = req.body;

    const lead = await Lead.findByIdAndUpdate(req.params.id, {
        status,
        $push: {
            notes: {
                text: note,
                createdBy: req.user._id,
            }
        }
    }, { new: true });

    res.json({ lead });
});
```

---

### 6. Analytics & Reporting ⭐⭐⭐⭐
**Current Status:** Basic message count only

**Missing:**
- Conversation analytics
- User behavior tracking
- Conversion tracking
- Provider performance comparison
- Cost per conversation
- Response time tracking

**Implementation:**
```javascript
// backend/src/models/Analytics.js
const analyticsSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    date: { type: Date, required: true },
    metrics: {
        totalMessages: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 },
        uniqueUsers: { type: Number, default: 0 },
        averageSessionDuration: { type: Number, default: 0 },
        averageMessagesPerSession: { type: Number, default: 0 },
        averageResponseTime: { type: Number, default: 0 },

        byProvider: {
            ollama: { messages: Number, avgResponseTime: Number },
            groq: { messages: Number, avgResponseTime: Number },
            openrouter: { messages: Number, avgResponseTime: Number },
            anthropic: { messages: Number, avgResponseTime: Number },
        },

        conversions: {
            leadsCaptured: { type: Number, default: 0 },
            formsSubmitted: { type: Number, default: 0 },
            goalsCompleted: { type: Number, default: 0 },
        },

        satisfaction: {
            positiveReactions: { type: Number, default: 0 },
            negativeReactions: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0 },
        }
    }
});

analyticsSchema.index({ workspace: 1, date: -1 });
```

```javascript
// backend/src/services/analyticsService.js
class AnalyticsService {
    // Aggregate daily analytics
    async aggregateDailyMetrics(workspaceId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get messages
        const messages = await Message.find({
            workspace: workspaceId,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Calculate metrics
        const metrics = {
            totalMessages: messages.length,
            totalSessions: new Set(messages.map(m => m.sessionId)).size,
            averageResponseTime: this.calculateAvgResponseTime(messages),
            byProvider: this.groupByProvider(messages),
        };

        // Save analytics
        await Analytics.findOneAndUpdate(
            { workspace: workspaceId, date: startOfDay },
            { metrics },
            { upsert: true }
        );
    }

    // Get analytics report
    async getReport(workspaceId, startDate, endDate) {
        const analytics = await Analytics.find({
            workspace: workspaceId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        return {
            daily: analytics,
            summary: this.calculateSummary(analytics),
            trends: this.calculateTrends(analytics),
            comparison: this.compareWithPrevious(analytics),
        };
    }

    calculateSummary(analytics) {
        return {
            totalMessages: analytics.reduce((sum, a) => sum + a.metrics.totalMessages, 0),
            totalSessions: analytics.reduce((sum, a) => sum + a.metrics.totalSessions, 0),
            avgResponseTime: this.average(analytics.map(a => a.metrics.averageResponseTime)),
            // ... more metrics
        };
    }
}

module.exports = new AnalyticsService();
```

---

### 7. Multi-language Support (i18n) ⭐⭐⭐
**Current Status:** EN/TH frontend only

**Missing:**
- Widget multi-language
- Auto-detect user language
- Backend error messages in multiple languages
- Email templates in multiple languages

**Implementation:**
```bash
npm install i18next i18next-http-middleware
```

```javascript
// backend/src/config/i18n.js
const i18next = require('i18next');
const middleware = require('i18next-http-middleware');

i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
        en: {
            translation: require('../locales/en.json')
        },
        th: {
            translation: require('../locales/th.json')
        },
        ja: {
            translation: require('../locales/ja.json')
        }
    }
});

module.exports = { i18next, middleware };
```

```json
// backend/src/locales/en.json
{
    "errors": {
        "auth": {
            "invalid_credentials": "Invalid email or password",
            "email_exists": "Email already registered",
            "token_expired": "Session expired, please login again"
        },
        "validation": {
            "required": "{{field}} is required",
            "invalid_email": "Invalid email format",
            "password_weak": "Password is too weak"
        },
        "quota": {
            "exceeded": "Monthly message quota exceeded. Please upgrade your plan.",
            "approaching": "You've used {{percentage}}% of your monthly quota"
        }
    },
    "emails": {
        "welcome": {
            "subject": "Welcome to MiniChat!",
            "body": "Hi {{username}}, welcome to our platform..."
        }
    }
}
```

---

### 8. File Storage (Cloud) ⭐⭐⭐
**Current Status:** Local filesystem only

**Why Needed:**
- Local storage ไม่ scale
- ไม่มี backup
- ไม่มี CDN

**Implementation:**
```bash
npm install aws-sdk multer-s3
```

```javascript
// backend/src/config/storage.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read',
        metadata: (req, file, cb) => {
            cb(null, {
                fieldName: file.fieldname,
                uploadedBy: req.user._id.toString(),
            });
        },
        key: (req, file, cb) => {
            const fileName = `uploads/${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isValid = allowedTypes.test(file.mimetype);
        cb(null, isValid);
    }
});

module.exports = upload;
```

---

## 🎨 Nice-to-Have Features (เพิ่มมูลค่า)

### 9. Conversation Export ⭐⭐⭐
- Export to PDF with branding
- Export to CSV for analysis
- Schedule automatic exports

### 10. Custom Branding (White Label) ⭐⭐⭐⭐
- Remove "Powered by MiniChat"
- Custom domain for widget
- Custom email domain

### 11. Canned Responses / Quick Replies ⭐⭐⭐
- Pre-defined responses
- Keyboard shortcuts
- Smart suggestions based on context

### 12. Chat Routing / Assignment ⭐⭐⭐⭐
- Auto-assign to team members
- Round-robin distribution
- Skill-based routing

### 13. Business Hours & Auto-Reply ⭐⭐⭐
- Schedule working hours
- Auto-reply outside hours
- Timezone support (already have)

### 14. Chat Transcripts via Email ⭐⭐⭐
- Send chat summary to user
- Send copy to team email

### 15. Mobile App (Optional) ⭐⭐
- React Native app
- Push notifications
- Offline support

### 16. API Rate Limiting per Plan ⭐⭐⭐
```javascript
const planLimits = {
    free: 100,      // requests/hour
    starter: 500,
    pro: 2000,
    business: 10000,
};
```

### 17. Custom AI Prompts per Workspace ⭐⭐⭐
- Already have systemPrompt
- Add prompt templates library
- A/B test different prompts

### 18. Widget A/B Testing ⭐⭐⭐
- Test different colors
- Test different messages
- Track conversion rates

### 19. Zapier Integration ⭐⭐⭐⭐
- Connect to 5000+ apps
- Triggers: New message, New lead
- Actions: Send message, Update lead

### 20. GDPR Tools ⭐⭐⭐⭐
- Cookie consent
- Data export (already have)
- Right to be forgotten
- Privacy policy generator

---

## 📊 Summary

### Must Have (Priority 1) - ทำก่อน Production
1. ✅ Payment Gateway (Stripe/PromptPay)
2. ✅ Email System (Complete)
3. ✅ Real-time (Socket.IO)
4. ✅ Admin Dashboard (Full)
5. ✅ Lead Capture System
6. ✅ Analytics & Reporting

### Should Have (Priority 2) - ทำหลัง Launch
7. Multi-language Support
8. Cloud Storage (S3)
9. Conversation Export
10. Custom Branding
11. Canned Responses
12. Chat Routing

### Nice to Have (Priority 3) - Future
13. Mobile App
14. Zapier Integration
15. Widget A/B Testing
16. Advanced GDPR Tools

---

**Total Essential Features:** 20+ รายการ
**Development Time:** 6-8 สัปดาห์สำหรับ Priority 1

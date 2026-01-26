const axios = require('axios');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const jwt = require('jsonwebtoken');

// Helper: Generate JWT Token
const generateToken = (id) => {
    // 📝 NOTE: สร้าง Token สำหรับ Login
    // ควรเปลี่ยน 'fallback_secret...' ใน .env ให้เป็นค่ายากๆ
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod', {
        expiresIn: '30d'
    });
};

// Helper: Handle User Creation/Login for OAuth
const handleOAuthUser = async (email, username, provider, providerId, avatar) => {
    // 📝 NOTE (Logic):
    // 1. เช็คว่ามี Email นี้ในระบบไหม?
    //    - มี: ถือว่า Login, อัพเดทข้อมูล Provider (เชื่อมบัญชี)
    //    - ไม่มี: สร้าง User ใหม่ และสร้าง Workspace ให้ด้วย

    // 1. Check if user exists by email
    let user = await User.findOne({ email });

    if (user) {
        // User exists - MERGE ACCOUNT
        // ไม่สนว่า User เก่ามาจากไหน (Local/GitHub/Google) ให้เชื่อมโยงกันได้เลย

        // ถ้า User นี้ยังไม่มี providerId (เช่นมาจาก Local) หรือมาจาก Provider อื่น
        // เราจะ Update ข้อมูลล่าสุดลงไป (เช่น Avatar)
        // แต่จะไม่ลบ Provider เดิม (ในอนาคตอาจจะเก็บเป็น Array ถ้าอยาก Support Multi-profile)

        // อัพเดทให้รู้ว่าเขาล่าสุดเข้ามาด้วยช่องทางนี้
        user.authProvider = provider;
        user.providerId = providerId;

        // ถ้ามีรูปใหม่และรูปเดิมว่างอยู่ ให้เติมรูป
        if (avatar && !user.avatar) {
            user.avatar = avatar;
        }

        await user.save();

    } else {
        // 2. Create new user
        // Ensure username is unique (append random string if needed)
        let uniqueUsername = username;
        let usernameExists = await User.findOne({ username: uniqueUsername });
        if (usernameExists) {
            uniqueUsername = `${username}_${Math.random().toString(36).substr(2, 5)}`;
        }

        user = await User.create({
            username: uniqueUsername,
            email,
            authProvider: provider,
            providerId,
            avatar
        });

        // 3. Create default workspace
        await Workspace.create({
            name: `${uniqueUsername}'s Workspace`,
            owner: user._id,
            plan: 'free'
        });
    }

    return user;
};

// @desc    Get Google Auth URL
// @route   GET /api/auth/google/url
exports.getGoogleAuthUrl = (req, res) => {
    // 🔍 DEBUG: Check if ID is loaded correctly
    console.log('-----------------------------------');
    console.log('DEBUG ADMIN: Requesting Google Auth URL');
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google');
    console.log('-----------------------------------');

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google',
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);

    // 🔍 DEBUG: Log Google URL Request
    const fs = require('fs');
    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Google URL Requested. Redirect URI: ${options.redirect_uri}\n`);

    res.json({ url: `${rootUrl}?${qs.toString()}` });
};

// @desc    Google/Gmail Login
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
    // ... existing googleLogin code ...
    try {
        const { code } = req.body; // รับ Code จาก Frontend

        // 📝 NOTE: แลก Code เป็น Token
        // ต้องตั้งค่า GOOGLE_CLIENT_ID และ SECRET ในไฟล์ .env ของ Backend
        const { data: { access_token } } = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google' // URL ต้องตรงกับที่ตั้งใน Google Console
        });

        // 2. Get user profile
        const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        // 3. Handle User
        const user = await handleOAuthUser(
            profile.email,
            profile.name || profile.email.split('@')[0],
            'google',
            profile.id,
            profile.picture
        );

        // 4. Get workspace
        const workspace = await Workspace.findOne({ owner: user._id });

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            },
            workspace: workspace ? {
                id: workspace._id,
                name: workspace.name,
                apiKey: workspace.apiKey
            } : null
        });

    } catch (error) {
        // 🔍 DEBUG: Log Google Error
        const fs = require('fs');
        fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Google Login Error: ${JSON.stringify(error.response?.data || error.message)}\n`);

        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Google Authentication Failed' });
    }
};

// @desc    Get GitHub Auth URL
// @route   GET /api/auth/github/url
exports.getGithubAuthUrl = (req, res) => {
    const rootUrl = 'https://github.com/login/oauth/authorize';
    const options = {
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback/github',
        scope: 'user:email',
    };

    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
};

// @desc    GitHub Login
// @route   POST /api/auth/github
exports.githubLogin = async (req, res) => {
    // ... existing githubLogin code ...
    try {
        const { code } = req.body;

        // 🔍 DEBUG: Log Credentials (Safe version)
        const fs = require('fs');
        const debugInfo = `\n[${new Date().toISOString()}] DEBUG CREDENTIALS:\n` +
            `- Client ID: '${process.env.GITHUB_CLIENT_ID}'\n` +
            `- Secret Length: ${process.env.GITHUB_CLIENT_SECRET ? process.env.GITHUB_CLIENT_SECRET.length : 0}\n` +
            `- Secret First 3 chars: ${process.env.GITHUB_CLIENT_SECRET ? process.env.GITHUB_CLIENT_SECRET.substring(0, 3) : "NONE"}\n`;
        fs.appendFileSync('debug.log', debugInfo);

        // 📝 NOTE: แลก Code เป็น Token
        // ต้องตั้งค่า GITHUB_CLIENT_ID และ SECRET ในไฟล์ .env
        const { data: { access_token } } = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: { Accept: 'application/json' }
        });

        // 2. Get user profile
        const { data: profile } = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        // GitHub doesn't always return public email, we might need to fetch it separately
        let email = profile.email;
        if (!email) {
            const { data: emails } = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            email = emails.find(e => e.primary).email;
        }

        // 3. Handle User
        const user = await handleOAuthUser(
            email,
            profile.login,
            'github',
            profile.id.toString(),
            profile.avatar_url
        );

        // 4. Get workspace
        const workspace = await Workspace.findOne({ owner: user._id });

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            },
            workspace: workspace ? {
                id: workspace._id,
                name: workspace.name,
                apiKey: workspace.apiKey
            } : null
        });

    } catch (error) {
        console.error('GitHub Auth Error:', error.response?.data || error.message);
        const fs = require('fs');
        const logMessage = `[${new Date().toISOString()}] GitHub Auth Error: ${JSON.stringify(error.response?.data || error.message)}\n`;
        fs.appendFileSync('debug.log', logMessage);

        console.error('GitHub Auth Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'GitHub Authentication Failed' });
    }
};

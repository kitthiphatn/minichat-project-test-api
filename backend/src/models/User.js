const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: function () {
            // 📝 NOTE (Thai): Password ต้องมีค่า ก็ต่อเมื่อเป็น User แบบ Local (Register ธรรมดา)
            // ถ้า Login ผ่าน Google/GitHub ไม่ต้องมี Password ก็ได้
            return !this.authProvider || this.authProvider === 'local';
        }
    },
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'], // 📝 NOTE: ระบุว่า User นี้ Login มาจากช่องทางไหน
        default: 'local'
    },
    providerId: {
        type: String // 📝 NOTE: เก็บ ID ที่ได้จาก Google/GitHub เอาไว้อ้างอิง
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    // Only hash password if it exists (it might not for OAuth users)
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

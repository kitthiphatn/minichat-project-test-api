'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Hash, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Ensure we have the base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuthPage() {
    const router = useRouter();
    // Modes: 'auth' (login/signup), 'forgot_email', 'forgot_otp', 'forgot_reset'
    const [view, setView] = useState('auth');
    const [isLogin, setIsLogin] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Forgot Password Data
    const [resetEmail, setResetEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    // Resend OTP Timer
    const [resendTimer, setResendTimer] = useState(0);
    const [canResend, setCanResend] = useState(false);

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/auth/google/url`);
            window.location.href = data.url;
        } catch (err) {
            console.error('Failed to get Google Auth URL:', err);
            setError('Failed to initiate Google Login. Please try again.');
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/auth/github/url`);
            window.location.href = data.url;
        } catch (err) {
            console.error('Failed to get GitHub Auth URL:', err);
            setError('Failed to initiate GitHub Login. Please try again.');
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation Logic (Same as before)
        if (!isLogin) {
            const englishRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/;
            if (formData.username && !englishRegex.test(formData.username)) {
                setError("Username: English characters only"); setLoading(false); return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match"); setLoading(false); return;
            }
        }

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { username: formData.username, email: formData.email, password: formData.password };

            const response = await axios.post(`${API_URL}${endpoint}`, payload);

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.workspace) localStorage.setItem('workspace', JSON.stringify(response.data.workspace));
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email: resetEmail });
            setView('forgot_otp');
            setSuccessMsg(`OTP sent to ${resetEmail}`);
            startResendTimer();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally { setLoading(false); }
    };

    const handleResendOTP = async () => {
        if (!canResend || loading) return;
        setLoading(true); setError(null); setSuccessMsg('');
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email: resetEmail });
            setSuccessMsg('New OTP sent!');
            startResendTimer();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally { setLoading(false); }
    };

    const startResendTimer = () => {
        setResendTimer(60);
        setCanResend(false);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVerifyOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        try {
            await axios.post(`${API_URL}/auth/verify-otp`, { email: resetEmail, otp });
            setView('forgot_reset');
            setSuccessMsg('OTP Verified! Enter new password.');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally { setLoading(false); }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);

        // Validate passwords match
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await axios.put(`${API_URL}/auth/reset-password`, { email: resetEmail, password: newPassword });
            setView('auth');
            setIsLogin(true);
            setSuccessMsg('Password reset successfully! Please login.');
            // Clear forgot password states
            setResetEmail(''); setOtp(''); setNewPassword(''); setConfirmNewPassword('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black selection:bg-purple-500/30">
            {/* Background Ambience */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 md:bg-purple-600/20 blur-[80px] md:blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 md:bg-blue-600/20 blur-[80px] md:blur-[120px] pointer-events-none" />

            <main className="relative z-10 w-full max-w-[420px] p-4 md:p-6">
                <div className="backdrop-blur-xl md:backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50 overflow-hidden relative min-h-[500px] flex flex-col justify-center">

                    <AnimatePresence mode="wait">
                        {/* VIEW 1: AUTH (LOGIN/SIGNUP) */}
                        {view === 'auth' && (
                            <motion.div
                                key="auth"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Toggle Switch */}
                                <div className="flex p-1 mb-6 bg-black/20 rounded-xl relative">
                                    <div className="absolute inset-0 p-1 flex">
                                        <motion.div
                                            className="w-1/2 bg-white/10 rounded-lg shadow-sm"
                                            layoutId="activeTab"
                                            initial={false}
                                            animate={{ x: isLogin ? '100%' : '0%' }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    </div>
                                    <button onClick={() => { setIsLogin(false); setError(null); }} className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${!isLogin ? 'text-white' : 'text-gray-400'}`}>Sign up</button>
                                    <button onClick={() => { setIsLogin(true); setError(null); }} className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${isLogin ? 'text-white' : 'text-gray-400'}`}>Sign in</button>
                                </div>

                                <h1 className="text-2xl font-bold text-white mb-2 text-center">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
                                <p className="text-gray-400 text-sm mb-6 text-center">{isLogin ? 'Enter your details to access your workspace' : 'Get started with your free account today'}</p>

                                {successMsg && (
                                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2 text-green-400 text-sm animate-pulse">
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}
                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm shake">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <form className="space-y-4" onSubmit={handleAuthSubmit}>
                                    {!isLogin && (
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400" />
                                            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50" />
                                        </div>
                                    )}
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400" />
                                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50 pr-12" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-white"><Eye className="w-5 h-5" /></button>
                                    </div>

                                    {!isLogin && (
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400" />
                                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50 pr-12" />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-white"><Eye className="w-5 h-5" /></button>
                                        </div>
                                    )}

                                    {isLogin && <div className="flex justify-end"><button type="button" onClick={() => { setView('forgot_email'); setError(null); setSuccessMsg(''); }} className="text-xs text-gray-400 hover:text-purple-400 transition-colors">Forgot Password?</button></div>}

                                    <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                                    </button>
                                </form>

                                <div className="relative my-6 md:my-8 animate-fade-in">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-black/40 backdrop-blur-sm text-gray-500 uppercase text-xs tracking-wider rounded">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:gap-4 animate-fade-in">
                                    <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl transition-all group active:scale-95">
                                        <span className="w-5 h-5 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        </span>
                                        <span className="text-sm font-medium">Gmail</span>
                                    </button>
                                    <button type="button" onClick={handleGithubLogin} className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl transition-all group active:scale-95">
                                        <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        <span className="text-sm font-medium">Github</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* VIEW 2: FORGOT EMAIL */}
                        {view === 'forgot_email' && (
                            <motion.div key="forgot_email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <button onClick={() => setView('auth')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
                                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                                <p className="text-gray-400 text-sm mb-6">Enter your email to receive a verification code.</p>
                                {error && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">{error}</div>}
                                <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your email" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Code'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* VIEW 3: OTP INPUT */}
                        {view === 'forgot_otp' && (
                            <motion.div key="forgot_otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <button onClick={() => setView('forgot_email')} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>
                                <h1 className="text-2xl font-bold text-white mb-2">Check your Email</h1>
                                <p className="text-gray-400 text-sm mb-6">We sent a 6-digit code to <b>{resetEmail}</b></p>
                                {successMsg && <div className="mb-4 p-3 bg-green-500/10 text-green-400 text-sm rounded-lg">{successMsg}</div>}
                                {error && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">{error}</div>}
                                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50 tracking-widest text-lg" maxLength={6} />
                                    </div>
                                    <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                                    </button>

                                    {/* Resend OTP Button */}
                                    <div className="text-center mt-4">
                                        {resendTimer > 0 ? (
                                            <p className="text-sm text-gray-400">
                                                Resend code in <span className="text-purple-400 font-semibold">{resendTimer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                disabled={loading || !canResend}
                                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                {loading ? 'Sending...' : 'Resend OTP'}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* VIEW 4: NEW PASSWORD */}
                        {view === 'forgot_reset' && (
                            <motion.div key="forgot_reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h1 className="text-2xl font-bold text-white mb-2">New Password</h1>
                                <p className="text-gray-400 text-sm mb-6">Set a new password for your account.</p>
                                {error && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">{error}</div>}
                                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="Confirm New Password"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-purple-500/50 pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                            className="absolute right-4 top-3.5 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set New Password'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

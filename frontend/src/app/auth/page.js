'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Ensure we have the base API URL
// Defaulting to localhost:5000 if env var is missing during dev
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
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
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const { data } = await axios.get(`${API_URL}/auth/github/url`);
            window.location.href = data.url;
        } catch (err) {
            console.error('Failed to get GitHub Auth URL:', err);
            setError('Failed to initiate GitHub Login. Please try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!isLogin) {
            // English-only validation
            const englishRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/;
            if (formData.username && !englishRegex.test(formData.username)) {
                setError("Username must contain only English characters");
                setLoading(false);
                return;
            }
            if (formData.password && !englishRegex.test(formData.password)) {
                setError("Password must contain only English characters");
                setLoading(false);
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }
            if (!formData.username) {
                setError("Username is required");
                setLoading(false);
                return;
            }
            if (!formData.email) { // Added email validation for signup
                setError("Email is required");
                setLoading(false);
                return;
            }
        } else { // Login validation
            if (!formData.email || !formData.password) {
                setError("Email and password are required");
                setLoading(false);
                return;
            }
        }

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';

            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { username: formData.username, email: formData.email, password: formData.password };

            const response = await axios.post(`${API_URL}${endpoint}`, payload);

            if (response.data.success) {
                // Store token, user, and workspace
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.workspace) {
                    localStorage.setItem('workspace', JSON.stringify(response.data.workspace));
                }

                // Redirect to dashboard
                router.push('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black selection:bg-purple-500/30">
            {/* Background Ambience (Optimized) */}
            <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 md:bg-purple-600/20 blur-[80px] md:blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 md:bg-blue-600/20 blur-[80px] md:blur-[120px] pointer-events-none" />

            <main className="relative z-10 w-full max-w-[420px] p-4 md:p-6">
                {/* Glass Card */}
                <div className="backdrop-blur-xl md:backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50">

                    {/* Toggle Switch */}
                    <div className="flex p-1 mb-6 md:mb-8 bg-black/20 rounded-xl relative">
                        <div className="absolute inset-0 p-1 flex">
                            <motion.div
                                className="w-1/2 bg-white/10 rounded-lg shadow-sm"
                                layoutId="activeTab"
                                initial={false}
                                animate={{
                                    x: isLogin ? '100%' : '0%',
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        </div>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign up
                        </button>
                        <button
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors duration-200 ${isLogin ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign in
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'signup'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
                                {isLogin ? 'Welcome back' : 'Create an account'}
                            </h1>
                            <p className="text-gray-400 text-sm mb-6 md:mb-8 text-center">
                                {isLogin
                                    ? 'Enter your details to access your workspace'
                                    : 'Get started with your free account today'}
                            </p>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                                {!isLogin && (
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="Username"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-base md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>
                                )}

                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-base md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all"
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-base md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all"
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm Password"
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-12 py-3 text-base md:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-white to-gray-200 text-black font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="relative my-6 md:my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-black/40 backdrop-blur-sm text-gray-500 uppercase text-xs tracking-wider rounded">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl transition-all group active:scale-95"
                                >
                                    <span className="w-5 h-5 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    </span>
                                    <span className="text-sm font-medium">Gmail</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGithubLogin}
                                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2.5 rounded-xl transition-all group active:scale-95"
                                >
                                    <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium">Github</span>
                                </button>
                            </div>

                        </motion.div>
                    </AnimatePresence>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6 md:mt-8">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </main>
        </div>
    );
}

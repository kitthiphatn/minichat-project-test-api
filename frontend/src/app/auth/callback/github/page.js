'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function GithubCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Authenticating with GitHub...');
    const [error, setError] = useState(null);
    const hasExecuted = useRef(false); // ป้องกันเรียกซ้ำ (ใช้ useRef)

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            setError('No authorization code found');
            setTimeout(() => router.push('/auth'), 3000);
            return;
        }

        const loginWithGithub = async () => {
            if (hasExecuted.current) return; // ถ้าเรียกไปแล้ว ไม่ต้องเรียกอีก
            hasExecuted.current = true;

            try {
                // Determine API URL (using next_public var if available or fallback)
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

                const response = await axios.post(`${API_URL}/auth/github`, { code });

                if (response.data.success && response.data.token) {
                    setStatus('Login successful! Redirecting...');

                    // Store token, user, and workspace
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    if (response.data.workspace) {
                        localStorage.setItem('workspace', JSON.stringify(response.data.workspace));
                    }

                    // Redirect to home after a brief delay
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1000);
                } else {
                    // If response doesn't have success or token, treat as error
                    setError('GitHub Authentication Failed');
                    setTimeout(() => router.push('/auth'), 3000);
                }
            } catch (err) {
                console.error('GitHub Login Error:', err);
                setError(err.response?.data?.error || 'GitHub Authentication Failed');
                setTimeout(() => router.push('/auth'), 3000);
            }
        };

        loginWithGithub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />

            <div className="z-10 text-center p-8 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 max-w-md w-full mx-4">
                {error ? (
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-red-500">Login Failed</h2>
                        <p className="text-gray-400">{error}</p>
                        <p className="text-sm text-gray-500 mt-4">Redirecting back to login...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold">{status}</h2>
                        <p className="text-gray-400 text-sm">Please wait while we set up your workspace...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

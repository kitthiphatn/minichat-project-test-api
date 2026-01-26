'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { getToken } from '@/lib/auth';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        if (sessionId) {
            confirmPayment();
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    const confirmPayment = async () => {
        try {
            const token = getToken();
            // In a real app, we might just poll for status, but here we trigger the mock success
            await axios.post(`${API_URL}/payment/mock-success`,
                { transactionId: sessionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus('success');
        } catch (error) {
            console.error('Payment confirmation error:', error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                {status === 'processing' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-purple-600 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h2>
                        <p className="text-gray-600 dark:text-gray-400">Please wait while we confirm your transaction.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Thank you for your purchase. Your workspace has been upgraded to Premium.
                        </p>
                        <Link
                            href="/dashboard"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            We couldn't confirm your payment. Please contact support.
                        </p>
                        <Link
                            href="/dashboard/billing"
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Return to Billing
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

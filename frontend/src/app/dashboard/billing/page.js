'use client';

import React, { useEffect, useState } from 'react';
import { Check, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { getWorkspace } from '@/lib/auth';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        messagesLimit: 250,
        features: [
            '250 messages/month',
            'Groq AI (Free)',
            'Basic widget customization',
            'Email support'
        ],
        color: 'gray',
        icon: Sparkles
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 19,
        messagesLimit: 2500,
        features: [
            '2,500 messages/month',
            'All AI providers',
            'Full widget customization',
            'Priority email support',
            'Analytics dashboard'
        ],
        color: 'blue',
        icon: Zap,
        popular: true
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 49,
        messagesLimit: 15000,
        features: [
            '15,000 messages/month',
            'All AI providers',
            'Advanced customization',
            'Priority support',
            'Advanced analytics',
            'Custom branding',
            'API access'
        ],
        color: 'purple',
        icon: TrendingUp
    },
    {
        id: 'business',
        name: 'Business',
        price: 149,
        messagesLimit: 75000,
        features: [
            '75,000 messages/month',
            'All AI providers',
            'White-label solution',
            'Dedicated support',
            'Custom integrations',
            'SLA guarantee',
            'Team management'
        ],
        color: 'indigo',
        icon: Sparkles
    }
];

export default function BillingPage() {
    const [workspace, setWorkspace] = useState(null);
    const [currentPlan, setCurrentPlan] = useState('free');

    useEffect(() => {
        const workspaceData = getWorkspace();
        if (workspaceData) {
            setWorkspace(workspaceData);
            setCurrentPlan(workspaceData.plan || 'free');
        }
    }, []);

    const handleUpgrade = (planId) => {
        alert(`Stripe integration coming soon! You selected: ${planId}`);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
                <p className="text-gray-600 mt-1">Choose the perfect plan for your needs</p>
            </div>

            {/* Current Plan Badge */}
            {workspace && (
                <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700">Current Plan</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1 capitalize">{currentPlan}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-purple-700">Usage This Month</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {workspace.usage?.messagesThisMonth || 0} / {workspace.usage?.messagesLimit || 250}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 w-full bg-purple-200 rounded-full h-2">
                        <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{
                                width: `${Math.min(((workspace.usage?.messagesThisMonth || 0) / (workspace.usage?.messagesLimit || 250)) * 100, 100)}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map((plan) => {
                    const isCurrentPlan = plan.id === currentPlan;
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-xl p-6 border-2 transition-all ${
                                isCurrentPlan
                                    ? 'border-purple-500 shadow-lg'
                                    : plan.popular
                                    ? 'border-blue-300 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        POPULAR
                                    </span>
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        CURRENT PLAN
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className={`w-12 h-12 bg-${plan.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                                    <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isCurrentPlan}
                                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                    isCurrentPlan
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}
                            >
                                {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">What happens if I exceed my message limit?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Your widget will stop processing new messages until you upgrade or wait for the monthly reset.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Can I change plans anytime?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Yes! You can upgrade or downgrade at any time. Changes take effect immediately.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">What AI providers are included?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Free plan includes Groq AI. Paid plans include Groq, OpenRouter, Anthropic, and Ollama.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Is there a free trial?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            The free plan is available forever. No credit card required to get started!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Zap, Crown, Shield, TrendingUp, Users, MessageSquare, BarChart3, Sparkles, ArrowRight } from 'lucide-react';
import { getWorkspace, getToken } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const plans = [
    {
        name: 'Free',
        price: 0,
        period: 'forever',
        description: 'Perfect for trying out MiniChat',
        icon: Zap,
        color: 'blue',
        features: [
            { name: 'Widget Customization', included: true },
            { name: 'Logo Upload (64x64)', included: true },
            { name: 'AI Chat (Groq/Ollama)', included: true },
            { name: 'System Prompt', included: true },
            { name: 'Embed Code', included: true },
            { name: 'Dark/Light Mode', included: true },
            { name: '100 Messages/Month', included: true },
            { name: '1 Workspace', included: true },
            { name: 'Community Support', included: true },
            { name: 'Multiple Workspaces', included: false },
            { name: 'Remove Branding', included: false },
            { name: 'Analytics Dashboard', included: false },
            { name: 'Priority Support', included: false },
            { name: 'Advanced AI Models', included: false },
        ],
        cta: 'Current Plan',
        popular: false
    },
    {
        name: 'Premium',
        price: 299,
        period: 'month',
        description: 'For small businesses',
        icon: Crown,
        color: 'purple',
        features: [
            { name: 'Everything in Free', included: true },
            { name: 'Unlimited Messages', included: true },
            { name: 'Multiple Workspaces (up to 5)', included: true },
            { name: 'Remove "Powered by MiniChat"', included: true },
            { name: 'Analytics Dashboard', included: true },
            { name: 'File Upload in Chat', included: true },
            { name: 'Human Handoff', included: true },
            { name: 'Custom Domain', included: true },
            { name: 'Priority Support (24/7)', included: true },
            { name: 'Advanced AI Models (Gemini Flash)', included: true },
            { name: 'API Access', included: false },
            { name: 'White Label Option', included: false },
        ],
        cta: 'Upgrade to Premium',
        popular: true
    },
    {
        name: 'Business',
        price: 999,
        period: 'month',
        description: 'For agencies & large teams',
        icon: Shield,
        color: 'indigo',
        features: [
            { name: 'Everything in Premium', included: true },
            { name: 'Unlimited Workspaces', included: true },
            { name: 'Unlimited Team Members', included: true },
            { name: 'Full White Label (No Branding)', included: true },
            { name: 'Advanced Model (Gemini Pro 1.5)', included: true },
            { name: 'Audit Logs & API Access', included: true },
            { name: 'Account Manager Support', included: true },
            { name: 'SLA 99.9% Uptime', included: true },
        ],
        cta: 'Contact Sales / Upgrade',
        popular: false
    }
];

export default function BillingPage() {
    const [workspace, setWorkspace] = useState(null);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly or yearly

    useEffect(() => {
        const workspaceData = getWorkspace();
        if (workspaceData) {
            setWorkspace(workspaceData);
            setCurrentPlan(workspaceData.plan || 'free');
        }
    }, []);

    const handleUpgrade = async (planName) => {
        try {
            const token = getToken();
            const res = await axios.post(`${API_URL}/payment/checkout`,
                {
                    plan: planName.toLowerCase(),
                    billingPeriod
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (res.data.success && res.data.checkoutUrl) {
                window.location.href = res.data.checkoutUrl;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to initiate checkout. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                        Choose Your Plan
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Start free and upgrade as you grow. No credit card required.
                    </p>

                    {/* Billing Period Toggle */}
                    <div className="mt-6 md:mt-8 inline-flex items-center bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-800/50">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'monthly'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'yearly'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-12 md:mb-16">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = currentPlan === plan.name.toLowerCase();
                        const yearlyPrice = billingPeriod === 'yearly' && plan.price > 0
                            ? Math.round(plan.price * 12 * 0.8)
                            : plan.price;

                        return (
                            <div
                                key={plan.name}
                                className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md ${plan.popular ? 'ring-2 ring-purple-500 border-purple-200 dark:border-purple-500/30' : 'border-gray-100 dark:border-gray-800/50'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                                        Most Popular
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Plan Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-3 bg-${plan.color}-100 dark:bg-${plan.color}-900/30 rounded-lg`}>
                                            <Icon className={`w-6 h-6 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {plan.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {plan.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                                ฿{billingPeriod === 'yearly' ? yearlyPrice : plan.price}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                /{billingPeriod === 'yearly' ? 'year' : plan.period}
                                            </span>
                                        </div>
                                        {billingPeriod === 'yearly' && plan.price > 0 && (
                                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                                Save ฿{plan.price * 12 - yearlyPrice} per year
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleUpgrade(plan.name)}
                                        disabled={isCurrentPlan}
                                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${isCurrentPlan
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : plan.popular
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isCurrentPlan ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                {plan.cta}
                                            </>
                                        ) : (
                                            <>
                                                {plan.cta}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    {/* Features List */}
                                    <ul className="mt-8 space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                {feature.included ? (
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <X className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span className={`text-sm ${feature.included
                                                    ? 'text-gray-700 dark:text-gray-300'
                                                    : 'text-gray-400 dark:text-gray-600 line-through'
                                                    }`}>
                                                    {feature.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/50 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Can I upgrade or downgrade anytime?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We accept credit cards, debit cards, and PromptPay for Thai customers.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Is there a free trial for Premium?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Yes! We offer a 14-day free trial for Premium plan. No credit card required.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                What happens if I exceed the message limit?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                On the Free plan, your widget will stop responding after 100 messages. Upgrade to Premium for unlimited messages.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Trusted by 1,000+ businesses worldwide
                    </p>
                    <div className="flex justify-center gap-8 flex-wrap">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm">SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-5 h-5" />
                            <span className="text-sm">24/7 Support</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-sm">99.9% Uptime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
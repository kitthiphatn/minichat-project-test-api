'use client';

import React, { useState, useEffect } from 'react';
import EmbedWidget from '../../../components/EmbedWidget';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function EmbedPage({ params }) {
    const { workspaceId } = params;
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Enforce transparent background
        document.documentElement.style.background = 'transparent';
        document.body.style.background = 'transparent';

        async function fetchSettings() {
            try {
                const response = await fetch(`${API_URL}/widget/config/${workspaceId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setSettings(data.config);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (workspaceId) {
            fetchSettings();
        }
    }, [workspaceId]);

    // Handle Toggle
    const handleToggle = (newState) => {
        setIsOpen(newState);
        // Post message to parent to resize iframe
        if (typeof window !== 'undefined') {
            window.parent.postMessage({
                type: 'MINICHAT_RESIZE',
                isOpen: newState
            }, '*');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen w-screen bg-transparent">
            {/* <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> */}
            {/* Cleaner to show nothing while loading in embed */}
        </div>
    );

    if (!settings) return null;

    return (
        <div className="h-full w-full bg-transparent overflow-hidden">
            <EmbedWidget
                settings={settings}
                isOpen={isOpen}
                onToggle={handleToggle}
            />
        </div>
    );
}

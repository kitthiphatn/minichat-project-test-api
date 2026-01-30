/**
 * MiniChat Widget - Standalone Version
 * Auto-generated from Widget Configuration
 *
 * This file is self-contained and requires no external dependencies.
 * Simply include it in your HTML: <script src="minichat-widget.js"></script>
 */

(function () {
    'use strict';

    // ==================== CONFIGURATION ====================
    // These values are injected by the backend when generating the widget
    const CONFIG = {
        apiKey: '__API_KEY__',
        apiUrl: '__API_URL__',
        botName: '__BOT_NAME__',
        welcomeMessage: '__WELCOME_MESSAGE__',
        widgetColor: '__WIDGET_COLOR__',
        position: '__POSITION__',
        logo: '__LOGO_URL__',
        workspaceId: '__WORKSPACE_ID__'
        // System prompt is now handled securely by the backend
    };

    // Helper to darken/lighten color for gradient
    function adjustColorBrightness(hex, percent) {
        let num = parseInt(hex.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Embedded Icons (Feather Icons)
    const DEFAULT_CHAT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    const SEND_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    // ==================== STYLES ====================
    const colorPrimary = CONFIG.widgetColor || '#6366f1';
    const colorDark = adjustColorBrightness(colorPrimary, -20);
    const gradient = `linear-gradient(135deg, ${colorPrimary} 0%, ${colorDark} 100%)`;

    const STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        :host {
            --mc-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --mc-spacing-sm: 8px;
            --mc-spacing-md: 16px;
            --mc-spacing-lg: 20px;
            --mc-button-size: 60px;
            --mc-window-width: 380px;
            --mc-window-height: 600px;
            --mc-primary: ${colorPrimary};
            --mc-gradient: ${gradient};
            
            /* Light Mode Defaults (Premium) */
            --mc-bg-chat: #ffffff;
            --mc-bg-message-bot: #ffffff;
            --mc-text-bot: #1f2937;
            --mc-border-bot: #f3f4f6;
            --mc-bg-input: #f9fafb;
            --mc-border-input: #e5e7eb;
            --mc-text-main: #111827;
            --mc-text-sub: #6b7280;
            --mc-shadow-window: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            --mc-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            :host {
                --mc-bg-chat: #1f2937; /* gray-800 */
                --mc-bg-message-bot: #374151; /* gray-700 */
                --mc-text-bot: #f9fafb; /* gray-50 */
                --mc-border-bot: #4b5563; /* gray-600 */
                --mc-bg-input: #111827; /* gray-900 */
                --mc-border-input: #374151;
                --mc-text-main: #f9fafb;
                --mc-text-sub: #9ca3af;
                --mc-shadow-window: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
        }

        #minichat-widget-container * {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            margin: 0;
            padding: 0;
            font-family: var(--mc-font-family);
        }

        #minichat-widget-container {
            /* Hosted inside a fixed-position Shadow Host */
            position: relative; 
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        #minichat-button, #minichat-window {
            pointer-events: auto;
        }

        /* Floating Button */
        #minichat-button {
            width: var(--mc-button-size);
            height: var(--mc-button-size);
            border-radius: 24px;
            background: var(--mc-gradient);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: absolute;
            bottom: 0;
            ${CONFIG.position === 'left' ? 'left: 0;' : 'right: 0;'}
        }

        #minichat-button:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        #minichat-button:active {
            transform: scale(0.95);
        }

        #minichat-button svg {
            width: 28px;
            height: 28px;
            color: white;
            transition: transform 0.3s ease;
        }

        /* Chat Window */
        #minichat-window {
            position: absolute;
            bottom: calc(var(--mc-button-size) + 20px);
            ${CONFIG.position === 'left' ? 'left: 0;' : 'right: 0;'}
            width: var(--mc-window-width);
            height: var(--mc-window-height);
            max-height: calc(100vh - 120px);
            background: var(--mc-bg-chat);
            border-radius: 20px;
            box-shadow: var(--mc-shadow-window);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            pointer-events: none;
            visibility: hidden;
            border: 1px solid rgba(0,0,0,0.05);
        }

        #minichat-window.open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
            visibility: visible;
        }

        /* Header */
        #minichat-header {
            background: var(--mc-gradient);
            padding: 20px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        }

        /* Header Shine Effect */
        #minichat-header::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(to top right, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0));
            pointer-events: none;
        }

        .mc-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10;
        }

        .mc-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%; /* Rounded full like preview */
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .mc-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .mc-header-info {
            z-index: 10;
        }

        .mc-header-info h3 {
            font-size: 15px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 2px;
        }

        .mc-status {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
            opacity: 0.9;
            font-weight: 500;
        }

        .mc-status-dot {
            width: 6px;
            height: 6px;
            background: #4ade80;
            border-radius: 50%;
            box-shadow: 0 0 0 1px rgba(255,255,255,0.2);
            animation: mc-pulse 2s infinite;
        }

        @keyframes mc-pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        #minichat-close {
            background: rgba(255,255,255,0.15);
            border: 0;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            z-index: 10;
        }

        #minichat-close:hover {
            background: rgba(255,255,255,0.25);
        }

        #minichat-close svg {
            width: 18px;
            height: 18px;
        }

        /* Messages */
        #minichat-messages {
            flex: 1;
            padding: 24px 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: var(--mc-bg-chat); /* Adaptive background */
            scroll-behavior: smooth;
        }

        /* Scrollbar */
        #minichat-messages::-webkit-scrollbar {
            width: 6px;
        }
        #minichat-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        #minichat-messages::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.1);
            border-radius: 3px;
        }

        .mc-message {
            max-width: 85%;
            animation: mc-fade-in 0.3s ease;
            position: relative;
            display: flex;
            align-items: flex-end;
            gap: 8px;
        }

        @keyframes mc-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .mc-message-content {
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: var(--mc-shadow-sm);
        }

        /* Bot Message */
        .mc-message.bot {
            align-self: flex-start;
        }
        .mc-message.bot .mc-message-content {
            background: var(--mc-bg-message-bot);
            color: var(--mc-text-bot);
            border: 1px solid var(--mc-border-bot);
            border-bottom-left-radius: 4px;
        }

        /* User Message */
        .mc-message.user {
            align-self: flex-end;
        }
        .mc-message.user .mc-message-content {
            background: var(--mc-gradient);
            color: white;
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Typing Indicator */
        .mc-typing {
            display: none;
            align-self: flex-start;
            background: var(--mc-bg-message-bot);
            border: 1px solid var(--mc-border-bot);
            padding: 12px 16px;
            border-radius: 16px;
            border-bottom-left-radius: 4px;
            gap: 4px;
            width: fit-content;
            margin-left: 0; /* Align with bot messages */
        }
        .mc-typing.active {
            display: flex;
        }
        .mc-dot {
            width: 6px;
            height: 6px;
            background: #9ca3af;
            border-radius: 50%;
            animation: mc-bounce 1.4s infinite ease-in-out both;
        }
        .mc-dot:nth-child(1) { animation-delay: -0.32s; }
        .mc-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes mc-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        /* Input Area */
        #minichat-footer {
            padding: 16px 20px;
            background: var(--mc-bg-chat);
            border-top: 1px solid var(--mc-border-bot);
        }

        .mc-input-container {
            display: flex;
            align-items: flex-end;
            gap: 10px;
        }

        .mc-input-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            background: var(--mc-bg-input);
            border-radius: 24px;
            padding: 8px 16px;
            transition: all 0.2s;
            border: 1px solid var(--mc-border-input);
            min-height: 44px;
        }

        .mc-input-wrapper:focus-within {
            background: var(--mc-bg-chat);
            border-color: var(--mc-primary);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        #minichat-input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 15px;
            outline: none;
            color: var(--mc-text-main);
            padding: 4px 0;
            font-family: inherit;
            line-height: 1.5;
        }
        
        #minichat-input::placeholder {
            color: var(--mc-text-sub);
            opacity: 0.8;
        }

        #minichat-send {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: var(--mc-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        #minichat-send:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        #minichat-send:disabled {
            background: var(--mc-border-input);
            color: var(--mc-text-sub);
            cursor: default;
            box-shadow: none;
        }

        #minichat-send svg {
            width: 20px;
            height: 20px;
            margin-left: 2px; /* Visual balance */
        }

        .mc-branding {
            text-align: center;
            font-size: 11px;
            color: var(--mc-text-sub);
            margin-top: 8px;
            opacity: 0.8;
        }
        .mc-branding a {
            color: var(--mc-text-sub);
            text-decoration: none;
            font-weight: 600;
        }

        /* Mobile */
        @media (max-width: 480px) {
            #minichat-window {
                position: fixed; /* Fix: Break out of container constraints */
                width: 100%;
                height: 100dvh; /* Use dynamic viewport height for mobile browsers */
                max-height: 100dvh;
                border-radius: 0;
                bottom: 0;
                right: 0;
                left: 0;
                top: 0; /* Ensure it hits top */
                z-index: 9999999; /* Ensure on top of everything */
            }
            #minichat-widget-container {
                right: 20px;
                bottom: 20px;
            }
        }
    `;

    // ==================== WIDGET CLASS ====================
    class MiniChatWidget {
        constructor(config) {
            this.config = config;
            this.isOpen = false;
            this.sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
            this.shadowRoot = null; // Store shadow root reference
        }

        init() {
            this.createWidget();
            this.attachEventListeners();
            this.addMessage('bot', this.config.welcomeMessage || 'Hello! How can I help you?');
        }

        createWidget() {
            // Create Host Element
            const host = document.createElement('div');
            host.id = 'minichat-host';
            // Ensure host acts as a stable anchor, but doesn't block clicks itself unless hit
            host.style.position = 'fixed';
            host.style.bottom = '0';
            host.style.right = '0'; // Default, will be overridden by internal logic if needed
            host.style.zIndex = '2147483647'; // Max z-index
            host.style.width = '0';
            host.style.height = '0';
            host.style.overflow = 'visible';

            document.body.appendChild(host);

            // Attach Shadow DOM
            this.shadowRoot = host.attachShadow({ mode: 'open' });

            // Prepare Content
            const logoHtml = this.config.logo && this.config.logo.length > 0 && this.config.logo !== '__LOGO_URL__'
                ? `<img src="${this.config.logo}" alt="" />`
                : `<span style="color:white; font-weight:bold; font-size:14px;">AI</span>`;

            // Inject Styles & HTML into Shadow DOM
            this.shadowRoot.innerHTML = `
                <style>
                    ${STYLES}
                </style>
                <div id="minichat-widget-container">
                    <button id="minichat-button" aria-label="Toggle chat">
                        ${DEFAULT_CHAT_ICON}
                    </button>

                    <div id="minichat-window">
                        <div id="minichat-header">
                            <div class="mc-header-left">
                                <div class="mc-avatar">
                                    ${logoHtml}
                                </div>
                                <div class="mc-header-info">
                                    <h3>${this.config.botName}</h3>
                                    <div class="mc-status">
                                        <span class="mc-status-dot"></span> Online
                                    </div>
                                </div>
                            </div>
                            <button id="minichat-close" aria-label="Close">
                                ${CLOSE_ICON}
                            </button>
                        </div>

                        <div id="minichat-messages"></div>

                        <div class="mc-typing" id="mc-typing">
                            <div class="mc-dot"></div><div class="mc-dot"></div><div class="mc-dot"></div>
                        </div>

                        <div id="minichat-footer">
                            <div class="mc-input-container">
                                <div class="mc-input-wrapper">
                                    <input type="text" id="minichat-input" placeholder="Type a message..." autocomplete="off">
                                </div>
                                <button id="minichat-send" aria-label="Send">
                                    ${SEND_ICON}
                                </button>
                            </div>
                            <div class="mc-branding">
                                Powered by <a href="#" target="_blank">MiniChat AI</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Cache Elements from Shadow Root
            this.elements = {
                container: this.shadowRoot.getElementById('minichat-widget-container'),
                button: this.shadowRoot.getElementById('minichat-button'),
                window: this.shadowRoot.getElementById('minichat-window'),
                messages: this.shadowRoot.getElementById('minichat-messages'),
                input: this.shadowRoot.getElementById('minichat-input'),
                sendBtn: this.shadowRoot.getElementById('minichat-send'),
                closeBtn: this.shadowRoot.getElementById('minichat-close'),
                typing: this.shadowRoot.getElementById('mc-typing')
            };
        }

        attachEventListeners() {
            this.elements.button.addEventListener('click', () => this.toggleChat());
            this.elements.closeBtn.addEventListener('click', () => this.toggleChat());
            this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
            this.elements.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        toggleChat() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.elements.window.classList.add('open');
                this.elements.button.style.transform = 'scale(0.8) rotate(90deg)';
                this.elements.button.style.opacity = '0';
                this.elements.button.style.pointerEvents = 'none';
                setTimeout(() => this.elements.input.focus(), 300);
            } else {
                this.elements.window.classList.remove('open');
                this.elements.button.style.transform = 'scale(1) rotate(0deg)';
                this.elements.button.style.opacity = '1';
                this.elements.button.style.pointerEvents = 'auto';
            }
        }

        addMessage(role, text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `mc-message ${role}`;

            // Format line breaks and sanitize basic HTML
            // Note: In a real prod environment, use DOMPurify. Here we allow specific tags or just text.
            // For now, mirroring previous logic but safer to create text nodes or simple replacements.
            const formattedText = text.replace(/\\n/g, '<br>');

            msgDiv.innerHTML = `
                <div class="mc-message-content">${formattedText}</div>
            `;

            this.elements.messages.appendChild(msgDiv);
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }

        async sendMessage() {
            const text = this.elements.input.value.trim();
            if (!text) return;

            this.addMessage('user', text);
            this.elements.input.value = '';
            this.elements.sendBtn.disabled = true;
            this.elements.typing.classList.add('active');
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;

            try {
                // Send Clean Message
                const response = await fetch(`${this.config.apiUrl}/chat/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    },
                    body: JSON.stringify({
                        message: text,
                        sessionId: this.sessionId,
                        workspaceId: this.config.workspaceId,
                        apiKey: this.config.apiKey
                    })
                });

                const data = await response.json();
                this.elements.typing.classList.remove('active');
                this.elements.sendBtn.disabled = false;

                if (data.success && (data.message || data.response)) {
                    this.addMessage('bot', data.message || data.response);
                } else {
                    this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
                }

            } catch (err) {
                console.error('Chat Error:', err);
                this.elements.typing.classList.remove('active');
                this.elements.sendBtn.disabled = false;
                this.addMessage('bot', 'Network error. Please check your connection.');
            }
        }
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new MiniChatWidget(CONFIG).init());
    } else {
        new MiniChatWidget(CONFIG).init();
    }
})();

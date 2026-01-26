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
    };

    // ==================== STYLES ====================
    const STYLES = `
        #minichat-widget-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        #minichat-widget-container {
            position: fixed;
            bottom: 20px;
            ${CONFIG.position === 'left' ? 'left: 20px;' : 'right: 20px;'}
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        #minichat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${CONFIG.widgetColor};
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
        }

        #minichat-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }

        #minichat-button svg {
            width: 28px;
            height: 28px;
            fill: white;
        }

        #minichat-window {
            position: absolute;
            bottom: 80px;
            ${CONFIG.position === 'left' ? 'left: 0;' : 'right: 0;'}
            width: 380px;
            height: 600px;
            max-height: calc(100vh - 120px);
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            display: none;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.3s ease;
            transform-origin: bottom ${CONFIG.position === 'left' ? 'left' : 'right'};
        }

        #minichat-window.open {
            display: flex;
            animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        #minichat-header {
            background: ${CONFIG.widgetColor};
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        #minichat-header-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        #minichat-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        #minichat-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        #minichat-logo svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        #minichat-header-text h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        #minichat-header-text p {
            font-size: 12px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        #minichat-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ade80;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        #minichat-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px;
            border-radius: 8px;
            transition: background 0.2s;
        }

        #minichat-close:hover {
            background: rgba(255,255,255,0.1);
        }

        #minichat-close svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        #minichat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        #minichat-messages::-webkit-scrollbar {
            width: 6px;
        }

        #minichat-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        #minichat-messages::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        .minichat-message {
            display: flex;
            gap: 12px;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .minichat-message.user {
            flex-direction: row-reverse;
        }

        .minichat-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: white;
            overflow: hidden;
        }

        .minichat-message.bot .minichat-avatar {
            background: ${CONFIG.widgetColor};
        }

        .minichat-message.user .minichat-avatar {
            background: #6b7280;
        }

        .minichat-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .minichat-bubble {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .minichat-message.bot .minichat-bubble {
            background: white;
            color: #1f2937;
            border-bottom-left-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .minichat-message.user .minichat-bubble {
            background: #1f2937;
            color: white;
            border-bottom-right-radius: 4px;
        }

        .minichat-typing {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
        }

        .minichat-typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #9ca3af;
            animation: typing 1.4s infinite;
        }

        .minichat-typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .minichat-typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
        }

        #minichat-input-container {
            padding: 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
        }

        #minichat-input-wrapper {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        #minichat-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
            font-family: inherit;
        }

        #minichat-input:focus {
            border-color: ${CONFIG.widgetColor};
        }

        #minichat-send {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${CONFIG.widgetColor};
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            flex-shrink: 0;
        }

        #minichat-send:hover:not(:disabled) {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        #minichat-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        #minichat-send svg {
            width: 18px;
            height: 18px;
            fill: white;
        }

        #minichat-powered {
            text-align: center;
            padding: 8px;
            font-size: 11px;
            color: #9ca3af;
        }

        #minichat-powered a {
            color: ${CONFIG.widgetColor};
            text-decoration: none;
            font-weight: 600;
        }

        /* Mobile Responsive */
        @media (max-width: 480px) {
            #minichat-window {
                width: calc(100vw - 40px);
                height: calc(100vh - 100px);
                max-height: calc(100vh - 100px);
            }

            #minichat-widget-container {
                bottom: 16px;
                ${CONFIG.position === 'left' ? 'left: 16px;' : 'right: 16px;'}
            }
        }
    `;

    // ==================== WIDGET CLASS ====================
    class MiniChatWidget {
        constructor(config) {
            this.config = config;
            this.isOpen = false;
            this.messages = [];
            this.sessionId = this.generateSessionId();
        }

        generateSessionId() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        init() {
            this.injectStyles();
            this.createWidget();
            this.attachEventListeners();
            this.addWelcomeMessage();
        }

        injectStyles() {
            const styleEl = document.createElement('style');
            styleEl.textContent = STYLES;
            document.head.appendChild(styleEl);
        }

        createWidget() {
            const container = document.createElement('div');
            container.id = 'minichat-widget-container';

            const logoHTML = this.config.logo && this.config.logo !== '__LOGO_URL__'
                ? `<img src="${this.config.logo}" alt="Logo" />`
                : `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`;

            container.innerHTML = `
                <div id="minichat-window">
                    <div id="minichat-header">
                        <div id="minichat-header-content">
                            <div id="minichat-logo">${logoHTML}</div>
                            <div id="minichat-header-text">
                                <h3>${this.config.botName}</h3>
                                <p><span id="minichat-status-dot"></span>Online</p>
                            </div>
                        </div>
                        <button id="minichat-close">
                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                        </button>
                    </div>
                    <div id="minichat-messages"></div>
                    <div id="minichat-input-container">
                        <div id="minichat-input-wrapper">
                            <input type="text" id="minichat-input" placeholder="Type a message..." />
                            <button id="minichat-send">
                                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                            </button>
                        </div>
                        <div id="minichat-powered">
                            Powered by <a href="https://minichat.ai" target="_blank">MiniChat</a>
                        </div>
                    </div>
                </div>
                <button id="minichat-button">
                    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </button>
            `;

            document.body.appendChild(container);
        }

        attachEventListeners() {
            document.getElementById('minichat-button').addEventListener('click', () => this.toggleChat());
            document.getElementById('minichat-close').addEventListener('click', () => this.toggleChat());
            document.getElementById('minichat-send').addEventListener('click', () => this.sendMessage());
            document.getElementById('minichat-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        toggleChat() {
            this.isOpen = !this.isOpen;
            const window = document.getElementById('minichat-window');

            if (this.isOpen) {
                window.classList.add('open');
                document.getElementById('minichat-input').focus();
            } else {
                window.classList.remove('open');
            }
        }

        addWelcomeMessage() {
            this.addMessage('bot', this.config.welcomeMessage);
        }

        addMessage(type, text) {
            const messagesContainer = document.getElementById('minichat-messages');
            const messageEl = document.createElement('div');
            messageEl.className = `minichat-message ${type}`;

            const avatarHTML = type === 'bot' && this.config.logo && this.config.logo !== '__LOGO_URL__'
                ? `<img src="${this.config.logo}" alt="Bot" />`
                : type === 'bot'
                    ? 'AI'
                    : 'You';

            messageEl.innerHTML = `
                <div class="minichat-avatar">${avatarHTML}</div>
                <div class="minichat-bubble">${this.escapeHtml(text)}</div>
            `;

            messagesContainer.appendChild(messageEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            this.messages.push({ type, text, timestamp: Date.now() });
        }

        showTypingIndicator() {
            const messagesContainer = document.getElementById('minichat-messages');
            const typingEl = document.createElement('div');
            typingEl.className = 'minichat-message bot';
            typingEl.id = 'minichat-typing-indicator';

            const avatarHTML = this.config.logo && this.config.logo !== '__LOGO_URL__'
                ? `<img src="${this.config.logo}" alt="Bot" />`
                : 'AI';

            typingEl.innerHTML = `
                <div class="minichat-avatar">${avatarHTML}</div>
                <div class="minichat-bubble">
                    <div class="minichat-typing">
                        <div class="minichat-typing-dot"></div>
                        <div class="minichat-typing-dot"></div>
                        <div class="minichat-typing-dot"></div>
                    </div>
                </div>
            `;

            messagesContainer.appendChild(typingEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        hideTypingIndicator() {
            const typingEl = document.getElementById('minichat-typing-indicator');
            if (typingEl) typingEl.remove();
        }

        async sendMessage() {
            const input = document.getElementById('minichat-input');
            const sendBtn = document.getElementById('minichat-send');
            const message = input.value.trim();

            if (!message) return;

            // Add user message
            this.addMessage('user', message);
            input.value = '';
            sendBtn.disabled = true;

            // Show typing indicator
            this.showTypingIndicator();

            try {
                const response = await fetch(`${this.config.apiUrl}/chat/message`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    },
                    body: JSON.stringify({
                        message: message,
                        sessionId: this.sessionId,
                        workspaceId: this.config.workspaceId
                    })
                });

                const data = await response.json();

                this.hideTypingIndicator();

                if (data.success && data.response) {
                    this.addMessage('bot', data.response);
                } else {
                    this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
                }
            } catch (error) {
                console.error('MiniChat Error:', error);
                this.hideTypingIndicator();
                this.addMessage('bot', 'Sorry, I\'m having trouble connecting. Please try again later.');
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // ==================== AUTO-INITIALIZE ====================
    function initWidget() {
        // Validate configuration
        if (CONFIG.apiKey === '__API_KEY__' || !CONFIG.apiKey) {
            console.error('MiniChat Widget: Invalid API key. Please download the widget from your dashboard.');
            return;
        }

        // Initialize widget
        new MiniChatWidget(CONFIG).init();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

})();

/**
 * MiniChat Widget
 * Copyright (c) 2024 MiniChat. All rights reserved.
 */
(function () {
    // Current Configuration (Injected by server or default)
    var config = window.miniChatConfig || {
        apiKey: '',
        position: 'right',
        apiBaseUrl: 'https://api.clubfivem.com/api',
        theme: {
            primaryColor: '#2563eb'
        }
    };

    // Determine API Base URL
    var API_URL = config.apiBaseUrl || 'https://api.clubfivem.com/api';

    // *** FETCH CONFIGURATION FUNCTION ***
    function initWidget() {
        if (!config.apiKey) {
            console.warn('MiniChat: No API Key provided via window.miniChatConfig');
            renderWidget(config); // Render with defaults
            return;
        }

        // Fetch config from server
        var xhr = new XMLHttpRequest();
        xhr.open('GET', API_URL + '/widget/init?apiKey=' + config.apiKey, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        if (response.success && response.config) {
                            // Merge server config with local defaults
                            var serverConfig = response.config;
                            config.botName = serverConfig.botName;
                            config.welcomeMessage = serverConfig.welcomeMessage;
                            config.theme.primaryColor = serverConfig.widgetColor;
                            config.position = serverConfig.position;
                            if (serverConfig.logo) config.logo = serverConfig.logo;
                        }
                    } catch (e) {
                        console.error('MiniChat: Failed to parse config', e);
                    }
                }
                // Render widget regardless of success (fallback to defaults)
                renderWidget(config);
            }
        };
        xhr.send();
    }

    // Wrap the rendering logic in a function to call after fetch
    function renderWidget(finalConfig) {
        // Create Main Container (Absolute positioning for dragging)
        var container = document.createElement('div');
        container.id = 'minichat-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style[finalConfig.position === 'left' ? 'left' : 'right'] = '20px';
        container.style.zIndex = '999999';
        container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = finalConfig.position === 'left' ? 'flex-start' : 'flex-end';
        container.style.gap = '10px';
        container.style.userSelect = 'none';
        container.style.touchAction = 'none';

        document.body.appendChild(container);

        var isOpen = false;
        var isDragging = false;
        var startX, startY, initialLeft, initialTop;

        // --- Drag Logic ---
        function dragStart(e) {
            if (e.target.closest('.minichat-close-btn') || e.target.closest('.minichat-input-area')) return;
            if (e.target.closest('#minichat-drag-handle') || e.target.closest('.minichat-header')) {
                isDragging = true;
                e.preventDefault();
                var clientX = e.clientX || e.touches[0].clientX;
                var clientY = e.clientY || e.touches[0].clientY;
                var rect = container.getBoundingClientRect();
                initialLeft = rect.left;
                initialTop = rect.top;
                startX = clientX;
                startY = clientY;
                container.style.bottom = 'auto';
                container.style.right = 'auto';
                container.style.left = initialLeft + 'px';
                container.style.top = initialTop + 'px';
                document.addEventListener('mousemove', drag);
                document.addEventListener('touchmove', drag, { passive: false });
                document.addEventListener('mouseup', dragEnd);
                document.addEventListener('touchend', dragEnd);
            }
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            var clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            var clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            var dx = clientX - startX;
            var dy = clientY - startY;
            var newLeft = initialLeft + dx;
            var newTop = initialTop + dy;
            var winWidth = window.innerWidth;
            var winHeight = window.innerHeight;
            var rect = container.getBoundingClientRect();
            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft + rect.width > winWidth) newLeft = winWidth - rect.width;
            if (newTop + rect.height > winHeight) newTop = winHeight - rect.height;
            container.style.left = newLeft + 'px';
            container.style.top = newTop + 'px';
        }

        function dragEnd() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        }
        // ------------------

        // Wrapper for Launcher + Drag Handle
        var launcherWrapper = document.createElement('div');
        launcherWrapper.style.display = 'flex';
        launcherWrapper.style.alignItems = 'center';
        launcherWrapper.style.gap = '8px';
        launcherWrapper.style.flexDirection = finalConfig.position === 'left' ? 'row-reverse' : 'row';

        // Drag Handle
        var dragHandle = document.createElement('div');
        dragHandle.id = 'minichat-drag-handle';
        dragHandle.style.width = '24px';
        dragHandle.style.height = '24px';
        dragHandle.style.borderRadius = '50%';
        dragHandle.style.backgroundColor = 'rgba(0,0,0,0.1)';
        dragHandle.style.cursor = 'move';
        dragHandle.style.display = 'flex';
        dragHandle.style.alignItems = 'center';
        dragHandle.style.justifyContent = 'center';
        dragHandle.style.transition = 'opacity 0.2s';
        dragHandle.style.opacity = '0';
        dragHandle.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="15 19 12 22 9 19"></polyline><polyline points="19 9 22 12 19 15"></polyline><circle cx="12" cy="12" r="1"></circle></svg>';

        launcherWrapper.onmouseenter = function () { dragHandle.style.opacity = '1'; };
        launcherWrapper.onmouseleave = function () { dragHandle.style.opacity = '0'; };
        dragHandle.onmousedown = dragStart;
        dragHandle.ontouchstart = dragStart;

        // Launcher Button
        var launcher = document.createElement('div');
        launcher.style.width = '60px';
        launcher.style.height = '60px';
        launcher.style.borderRadius = '50%';
        launcher.style.backgroundColor = finalConfig.theme.primaryColor || '#2563eb';
        launcher.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        launcher.style.cursor = 'pointer';
        launcher.style.display = 'flex';
        launcher.style.alignItems = 'center';
        launcher.style.justifyContent = 'center';
        launcher.style.transition = 'transform 0.2s';
        launcher.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

        launcher.onclick = function (e) {
            if (!isDragging) toggleChat();
        };

        launcherWrapper.appendChild(dragHandle);
        launcherWrapper.appendChild(launcher);

        // Chat Window
        var chatWindow = document.createElement('div');
        chatWindow.style.width = '350px';
        chatWindow.style.height = '500px';
        chatWindow.style.backgroundColor = 'white';
        chatWindow.style.borderRadius = '16px';
        chatWindow.style.boxShadow = '0 5px 40px rgba(0,0,0,0.16)';
        chatWindow.style.display = 'none';
        chatWindow.style.flexDirection = 'column';
        chatWindow.style.overflow = 'hidden';
        chatWindow.style.border = '1px solid #e1e4e8';
        chatWindow.style.marginBottom = '10px';

        // Chat Header
        var header = document.createElement('div');
        header.className = 'minichat-header';
        header.style.padding = '16px';
        header.style.backgroundColor = finalConfig.theme.primaryColor || '#2563eb';
        header.style.color = 'white';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.cursor = 'move';

        var headerTitle = document.createElement('div');
        headerTitle.innerHTML = `<h3 style="margin:0;font-size:16px;font-weight:600;">${finalConfig.botName || 'Support Agent'}</h3>`;

        var closeBtn = document.createElement('div');
        closeBtn.className = 'minichat-close-btn';
        closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = function (e) {
            e.stopPropagation();
            toggleChat();
        };

        header.appendChild(headerTitle);
        header.appendChild(closeBtn);
        chatWindow.appendChild(header);

        header.onmousedown = dragStart;
        header.ontouchstart = dragStart;

        // Chat Messages
        var messagesContainer = document.createElement('div');
        messagesContainer.style.flex = '1';
        messagesContainer.style.padding = '16px';
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.backgroundColor = '#f9fafb';
        chatWindow.appendChild(messagesContainer);

        function addMessage(text, sender) {
            var msgDiv = document.createElement('div');
            msgDiv.style.marginBottom = '10px';
            msgDiv.style.textAlign = sender === 'user' ? 'right' : 'left';

            var bubble = document.createElement('div');
            bubble.style.display = 'inline-block';
            bubble.style.padding = '8px 12px';
            bubble.style.borderRadius = '12px';
            bubble.style.maxWidth = '80%';
            bubble.style.fontSize = '14px';

            if (sender === 'user') {
                bubble.style.backgroundColor = finalConfig.theme.primaryColor || '#2563eb';
                bubble.style.color = 'white';
                bubble.style.borderTopRightRadius = '2px';
            } else {
                bubble.style.backgroundColor = 'white';
                bubble.style.color = '#333';
                bubble.style.border = '1px solid #eee';
                bubble.style.borderTopLeftRadius = '2px';
            }

            bubble.textContent = text;
            msgDiv.appendChild(bubble);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Initial Welcome Message
        if (finalConfig.welcomeMessage) {
            addMessage(finalConfig.welcomeMessage, 'bot');
        }

        // Chat Input
        var inputContainer = document.createElement('div');
        inputContainer.className = 'minichat-input-area';
        inputContainer.style.padding = '16px';
        inputContainer.style.borderTop = '1px solid #eee';
        inputContainer.style.backgroundColor = 'white';
        inputContainer.innerHTML = '<input type="text" placeholder="Type a message..." style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;outline:none;">';

        var input = inputContainer.querySelector('input');
        input.onkeypress = function (e) {
            if (e.key === 'Enter' && this.value.trim()) {
                sendMessage(this.value.trim());
                this.value = '';
            }
        };

        chatWindow.appendChild(inputContainer);
        container.appendChild(chatWindow);
        container.appendChild(launcherWrapper);

        function toggleChat() {
            isOpen = !isOpen;
            chatWindow.style.display = isOpen ? 'flex' : 'none';
            launcher.innerHTML = isOpen
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
        }

        function sendMessage(text) {
            addMessage(text, 'user');
            // Fetch response from API later...
            setTimeout(function () {
                addMessage('Thank you for your message. This is a demo response.', 'bot');
            }, 1000);
        }
    }

    // Start Initialization
    initWidget();

})();

import './globals.css';

export const metadata = {
    title: 'Mini Chat Ollama',
    description: 'Chat with AI using Ollama, OpenRouter, Groq, and Anthropic',
    keywords: ['chat', 'ai', 'ollama', 'openrouter', 'groq', 'anthropic'],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

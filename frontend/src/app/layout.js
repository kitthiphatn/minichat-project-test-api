import './globals.css';

export const metadata = {
    title: 'MiniChat - AI Chat Platform',
    description: 'Enterprise-grade AI chat platform with customizable widgets, multi-provider support, and seamless integration.',
    keywords: ['chat', 'ai', 'widget', 'saas', 'customer-support', 'groq', 'anthropic'],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="antialiased">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
                <meta name="theme-color" content="#0a0a0f" />
            </head>
            <body className="font-sans">{children}</body>
        </html>
    );
}

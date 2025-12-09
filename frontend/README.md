# Frontend - Mini Chat Ollama

Next.js 14 frontend for Mini Chat Ollama with Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local if needed

# Run development server
npm run dev

# Or build and run production
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.js          # Main chat page
│   │   ├── layout.js        # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   └── ChatInterface.js # Main chat component
│   └── lib/
│       └── api.js           # API client
├── .env.local.example       # Environment template
├── next.config.js           # Next.js config
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── package.json             # Dependencies
└── README.md                # This file
```

## Components

### ChatInterface
Main chat component with:
- Message display (user/AI distinction)
- Provider and model selection
- Input field with character counter
- Loading indicator
- Error handling
- Auto-scroll
- Clear chat button

### API Client
Axios-based client with functions:
- `getProviders()` - Get available AI providers
- `getChatHistory()` - Get chat history
- `sendMessage()` - Send message to AI
- `clearChat()` - Clear chat history

## Styling

Uses Tailwind CSS with custom:
- Gradient background
- Fade-in animations
- Loading dot animations
- Message bubble styles
- Hover effects

## Features

- ✅ Responsive design
- ✅ Real-time character counter (0/500)
- ✅ Auto-scroll to newest messages
- ✅ Loading indicators
- ✅ Error messages
- ✅ Provider/model selection
- ✅ Clear chat confirmation
- ✅ Smooth animations

## Development

```bash
# Install dependencies
npm install

# Run dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
Build the production bundle:
```bash
npm run build
```

Then deploy the `.next` folder to your hosting platform.

## Environment Configuration

Make sure to set the API URL in your deployment:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## Troubleshooting

### Can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Make sure backend is running on the specified URL
- Check CORS settings in backend

### Styles not loading
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.js` content paths
- Restart dev server

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## License

MIT

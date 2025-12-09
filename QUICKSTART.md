# 🚀 Quick Start Guide - Mini Chat Ollama

Get up and running with Mini Chat Ollama in **5 minutes**!

## ✅ Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Node.js** v18 or higher ([Download](https://nodejs.org/))
- [ ] **npm** v9 or higher (comes with Node.js)
- [ ] **MongoDB** (local install or Docker)
- [ ] **Ollama** ([Download](https://ollama.ai/))
- [ ] **Git** (optional, for cloning)

### Quick Check

```bash
node --version   # Should be v18+
npm --version    # Should be v9+
mongod --version # Or use Docker
ollama --version # Should be installed
```

## 🎯 5-Minute Setup

### Option 1: Automated Setup (Recommended)

```bash
# Navigate to project directory
cd mini-chat-ollama

# Run setup script (Linux/Mac)
chmod +x setup.sh
./setup.sh

# For Windows, run commands manually (see Option 2)
```

### Option 2: Manual Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Install frontend dependencies
cd ../frontend
npm install

# 3. Create environment files
cd ../backend
cp .env.example .env

cd ../frontend
cp .env.local.example .env.local

# 4. Start MongoDB (choose one)
# Option A: Using Docker (recommended)
cd ..
docker-compose up -d

# Option B: Using local MongoDB
mongod

# 5. Start Ollama and pull a model
ollama serve
ollama pull llama3
```

## 🏃 Running the Application

Open **two terminal windows**:

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
✓ Server running on http://localhost:5000
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

## 🎉 You're Ready!

1. Open your browser to **http://localhost:3000**
2. You should see the chat interface
3. Type a message and press Send
4. The AI should respond within a few seconds

## 🔧 Quick Configuration

### Using Different AI Providers

By default, the app uses **Ollama** (local). To use other providers:

1. Edit `backend/.env`
2. Add your API keys:

```env
# Optional providers
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

3. Restart the backend server
4. Select the provider from the dropdown in the UI

## 🐛 Quick Troubleshooting

### Backend won't start

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**: MongoDB is not running
```bash
# Using Docker
docker-compose up -d

# Or start local MongoDB
mongod
```

### Frontend won't connect to backend

**Problem**: `Network Error` or `Failed to fetch`

**Solution**: Check `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Ollama not responding

**Problem**: `Ollama connection failed`

**Solution**: 
```bash
# Make sure Ollama is running
ollama serve

# Pull the model you want to use
ollama pull llama3

# Check if it's working
ollama list
```

### Port already in use

**Problem**: `Port 5000 is already in use`

**Solution**: Change the port in `backend/.env`
```env
PORT=5001
```

Then update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## 📚 Next Steps

Now that you're up and running:

1. **Read the full README.md** for detailed documentation
2. **Try different AI providers** by adding API keys
3. **Explore the code** to understand the architecture
4. **Customize the UI** in `frontend/src/components/ChatInterface.js`
5. **Add features** - see CONTRIBUTING.md for ideas

## 🆘 Still Having Issues?

1. Check the full **Troubleshooting** section in README.md
2. Review the **backend/README.md** and **frontend/README.md**
3. Make sure all prerequisites are properly installed
4. Check that all environment variables are set correctly
5. Look at the console logs for error messages

## 💡 Pro Tips

- **Use Docker** for MongoDB - it's easier than local installation
- **Start with Ollama** - no API keys needed
- **Check the health endpoint** - http://localhost:5000/health
- **Use `npm run dev`** for development (auto-reload)
- **Clear chat** if you get stuck in a conversation

## 📊 What You Should See

### Backend Console
```
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[INFO] Server running on http://localhost:5000
[INFO] CORS enabled for http://localhost:3000
[INFO] Available providers: ollama
```

### Frontend Browser
- Clean chat interface with gradient background
- Provider and model selection dropdowns
- Message input with character counter
- Send and Clear Chat buttons

### First Message Test
```
You: Hello!
AI: Hello! How can I help you today?
```

## ⏱️ Expected Timeline

- **Setup**: 3-5 minutes
- **First run**: 1-2 minutes
- **First message**: 5-10 seconds
- **Total**: ~5-10 minutes

---

**Congratulations! You're now ready to chat with AI! 🎊**

For more details, see the [Main README](README.md).

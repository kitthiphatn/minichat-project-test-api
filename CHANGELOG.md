# Changelog

All notable changes to the Mini Chat Ollama project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-09

### Added
- Initial release of Mini Chat Ollama
- Full-stack chat application with Express.js backend and Next.js 14 frontend
- Support for 4 AI providers:
  - Ollama (local) - Default provider
  - OpenRouter (cloud)
  - Groq (fast inference)
  - Anthropic (Claude models)
- Dynamic model selection for each provider
- MongoDB integration for message persistence
- Professional UI with gradient background and Tailwind CSS
- Real-time chat interface with user/AI message distinction
- Loading indicators and error handling
- Auto-scroll to newest messages
- Clear chat functionality
- Character counter (500 character limit)
- Response time tracking and display
- Multi-session schema support (ready for future enhancements)
- Docker Compose configuration for MongoDB
- Automated setup script (setup.sh)
- Comprehensive documentation:
  - Main README.md (15KB+)
  - Quick start guide
  - Project summary
  - Contributing guidelines
  - Backend and frontend specific docs
- Environment variable templates
- Health check endpoint
- CORS configuration
- Request logging with Morgan

### Core Features
- ✅ Single-page chat interface
- ✅ Send/receive messages from AI
- ✅ Message history stored in MongoDB
- ✅ User/AI message distinction (different styling)
- ✅ Loading indicator while AI responds
- ✅ Error handling and display
- ✅ Data persistence across page reloads
- ✅ Max message length: 500 characters

### Bonus Features
- ✅ Auto-scroll to newest message
- ✅ Clear chat button
- ✅ Schema design for future multi-session support
- ✅ Character counter (0/500)
- ✅ Response time display

### Extra Features
- ✅ Multi-provider support (4 providers)
- ✅ Dynamic model selection
- ✅ Provider availability detection
- ✅ Professional UI/UX
- ✅ 20KB+ documentation
- ✅ Setup automation
- ✅ Docker support

## [Unreleased]

### Planned Features
- [ ] User authentication and authorization
- [ ] Multiple chat sessions per user
- [ ] Session management UI
- [ ] Export chat history
- [ ] Custom system prompts
- [ ] Streaming responses
- [ ] Voice input support
- [ ] Image generation integration
- [ ] Rate limiting
- [ ] API key management UI
- [ ] Dark/light theme toggle
- [ ] Mobile app (React Native)
- [ ] Deployment guides (Vercel, Railway, DigitalOcean)
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Analytics dashboard

---

## Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes
